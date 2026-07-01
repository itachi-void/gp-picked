import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smartwaste.runasp.net";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { search } = new URL(request.url);
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Authorization token is required" }, { status: 401 });
    }

    const backendUrl = `${API_BASE_URL}/api/User/GetRankingUser/${id}${search}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": authHeader,
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      const errorMessage =
        (typeof responseData === "object" && responseData?.message) ||
        (typeof responseData === "string" && responseData) ||
        "Backend server error while fetching user ranking";

      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ message: "Connection to backend API timed out" }, { status: 504 });
    }

    console.error("[GetRankingUser API Exception]:", error);
    return NextResponse.json({ message: "Internal server error occurred" }, { status: 500 });
  }
}
