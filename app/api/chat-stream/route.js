import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Present" : "Missing");

    const { message } = await request.json();
    // console.log("Received message:", message);
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Try a different model
      messages: [{role: "user", content: message}],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const content = chunk.choices[0].delta?.content || "";
                if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({content})}\n\n`)
                  );
                }
            }
            controller.close();
        },
    });
    // console.log("OpenAI response:", completion);
    return NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
   });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {error: "Error occurred while processing your request."},
      {status: 500}
    );
  }
}