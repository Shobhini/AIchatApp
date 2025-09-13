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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Try a different model
      messages: [{role: "user", content: message}]
    });
    // console.log("OpenAI response:", completion);
    return NextResponse.json({response: completion.choices[0].message.content});
  } catch (error) {
    console.error("API Error:", error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing and usage limits." }, 
        { status: 429 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your API key." }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json(
        { error: error.message || "An error occurred while processing your request." }, 
        { status: 500 }
    );
  }
}