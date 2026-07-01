import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smartwaste.runasp.net";

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | any }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const pathSegments = resolvedParams?.path || [];
    const joinedPath = pathSegments.join("/");

    // Build backend URL including search query parameters
    const { search } = new URL(request.url);
    const backendUrl = `${API_BASE_URL}/api/${joinedPath}${search}`;

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
