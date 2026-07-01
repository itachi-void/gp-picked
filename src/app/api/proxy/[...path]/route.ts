import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smartwaste.runasp.net";

function getMockData() {
  try {
    const filePath = path.join(process.cwd(), "scratch", "mock_points.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading mock data:", e);
  }
  return { points: 5000, redemptions: [] };
}

function saveMockData(data: { points: number; redemptions: any[] }) {
  try {
    const filePath = path.join(process.cwd(), "scratch", "mock_points.json");
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing mock data:", e);
  }
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | any }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const pathSegments = resolvedParams?.path || [];
    const joinedPath = pathSegments.join("/");

    // 1. Intercept redeem-points-to-cash POST request
    if (joinedPath === "Payment/redeem-points-to-cash" && request.method === "POST") {
      const { searchParams } = new URL(request.url);
      const walletNumber = searchParams.get("walletNumber") || "";
      const pointsToRedeemStr = searchParams.get("pointsToRedeem") || "0";
      const pointsToRedeem = Number(pointsToRedeemStr) || 0;

      const mockData = getMockData();
      const currentPoints = mockData.points || 0;
      if (pointsToRedeem > currentPoints) {
        return NextResponse.json(
          { message: `Insufficient points. You only have ${currentPoints} points.` },
          { status: 400 }
        );
      }

      const newPoints = currentPoints - pointsToRedeem;
      const newRedemption = {
        redemptionId: Date.now(),
        userId: 168,
        transactionType: "PointsRedeem",
        points: pointsToRedeem,
        amountEgp: pointsToRedeem * 0.1,
        transactionDate: new Date().toISOString(),
        status: "Completed",
        details: `Redeemed to ${walletNumber}`,
      };

      mockData.points = newPoints;
      mockData.redemptions = mockData.redemptions || [];
      mockData.redemptions.push(newRedemption);

      saveMockData(mockData);

      console.log(`[Mock Proxy] Redeemed ${pointsToRedeem} points. New mock balance: ${newPoints}`);
      return new NextResponse("Points redeemed successfully", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Build backend URL including search query parameters
    const { search } = new URL(request.url);
    const backendUrl = `${API_BASE_URL}/api/${joinedPath}${search}`;

    // 3. Intercept GetHistoryOfRedemption for user 168
    if (joinedPath === "PickupRequests/GetHistoryOfRedemption/168" && request.method === "GET") {
      const authHeader = request.headers.get("authorization");
      const forwardHeaders: Record<string, string> = {};
      if (authHeader) {
        forwardHeaders["Authorization"] = authHeader;
      }
      forwardHeaders["Accept"] = "application/json";

      let backendRedemptions = [];
      try {
        const backendRes = await fetch(backendUrl, {
          method: "GET",
          headers: forwardHeaders,
        });
        if (backendRes.status === 200) {
          backendRedemptions = await backendRes.json();
        }
      } catch (err) {
        console.error("Failed to fetch backend redemptions:", err);
      }

      const mockData = getMockData();
      const localRedemptions = mockData.redemptions || [];
      const combined = [...localRedemptions, ...backendRedemptions];
      
      combined.sort((a: any, b: any) => {
        const dateA = new Date(a.transactionDate || 0).getTime();
        const dateB = new Date(b.transactionDate || 0).getTime();
        return dateB - dateA;
      });

      return NextResponse.json(combined);
    }

    console.log(`[Reverse Proxy] ${request.method} -> ${backendUrl}`);

    // Read headers and forward authorization
    const authHeader = request.headers.get("authorization");
    const headers: Record<string, string> = {};

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Forward content-type (بما في ذلك multipart للرفع)
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    headers["Accept"] = "application/json";

    // Read raw body if applicable
    let body: any = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = request.body; // Forward ReadableStream directly
    }

    // Call backend API
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
      // @ts-ignore
      duplex: "half", // Required for forwarding readable stream in Next.js fetch
    });

    const responseStatus = response.status;
    const responseText = await response.text();

    console.log(`[Reverse Proxy] Response Status: ${responseStatus}`);

    // Build JSON or text response
    let responseData;
    let isJson = false;
    try {
      responseData = JSON.parse(responseText);
      isJson = true;
    } catch {
      responseData = responseText;
    }

    // 2. Intercept GetUserByIdWithDetails to inject mock points
    if (isJson && responseStatus === 200 && joinedPath.startsWith("User/GetUserByIdWithDetails/")) {
      const userId = joinedPath.split("/").pop();
      if (userId === "168") { // Inject for user 168
        const mockPoints = getMockData().points;
        console.log(`[Mock Proxy] Injecting ${mockPoints} points for user 168`);
        if (responseData) {
          responseData.walletPoints = mockPoints;
          if (responseData.data) {
            responseData.data.walletPoints = mockPoints;
          }
        }
      }
    }

    if (isJson) {
      return NextResponse.json(responseData, { status: responseStatus });
    } else {
      return new NextResponse(responseText, {
        status: responseStatus,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error: any) {
    console.error("[Reverse Proxy Exception]:", error);
    return NextResponse.json(
      { message: "Internal server error occurred in proxy", error: error.message },
      { status: 500 }
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as DELETE,
  handleProxy as PATCH,
};
