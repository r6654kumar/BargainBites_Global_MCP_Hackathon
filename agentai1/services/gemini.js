import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runGeminiAgent(userMessage) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
You are a smart food delivery assistant.
Understand user's intent and extract if they want to order something.
Reply in JSON format like:
{ "intent": "order", "food": "pizza" }
or
{ "intent": "query", "reply": "We are open from 10 AM to 10 PM." }

User: ${userMessage}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return { intent: "unknown", reply: "Sorry, I didn't understand that." };
  }
}
