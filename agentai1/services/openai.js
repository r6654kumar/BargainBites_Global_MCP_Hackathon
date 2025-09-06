// services/openai.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runLLMAgent(userMessage) {
  const prompt = `
You are a food delivery assistant.
Extract the user's intent and food item.
Respond ONLY in JSON format:
{
  "intent": "order",
  "food": "pizza"
}
or
{
  "intent": "query",
  "reply": "We are open 10am–10pm."
}
User: ${userMessage}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }]
  });

  const reply = res.choices[0].message.content.trim();

  try {
    return JSON.parse(reply);
  } catch {
    return { intent: "unknown", reply: "Sorry, I didn't understand." };
  }
}
