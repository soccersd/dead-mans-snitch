import { NextRequest, NextResponse } from "next/server";

interface JudgeRequest {
  content: string;
  wallet_address: string;
}

interface JudgeResponse {
  score: number;
  message: string;
  accepted: boolean;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<JudgeResponse | { error: string }>> {
  try {
    const body: JudgeRequest = await request.json();
    const { content, wallet_address } = body;

    // Forward to Python backend
    const response = await fetch("http://localhost:8000/judge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        wallet_address,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data: JudgeResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to judge backend:", error);
    return NextResponse.json(
      { error: "Failed to analyze secret. The Judge is unavailable." },
      { status: 500 }
    );
  }
}
