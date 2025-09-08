import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { aggregatorAgent } from "./agent.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { verifyDescopeSession } from "./middleware/verifyDescopeSession.js";
import fetch from "node-fetch";
import cors from "cors";
const app = express();
app.use(express.json());
const PORT = 8000;

//---------cors enabled
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://bargainbitesagent.vercel.app"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  // handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

//----test---------
app.listen(PORT, () => {
    console.log(`BargainBites Aggregator Agent Server running successfully on ${PORT}`);
})

//---post message to aggregator agent

// app.post("/chat", async (req, res) => {
//     try {
//         const { message } = req.body;
//         if (!message)
//             return res.status(400).json({
//                 error: "No Input"
//             })
//         console.log("[BargainBites] Received : ", message);
//         const result = await aggregatorAgent.invoke({
//             messages: [new HumanMessage(message)],
//         });
//         const lastMessage = result.messages[result.messages.length - 1];
//         const reply = typeof lastMessage.content === "string" ? lastMessage.content : JSON.stringify(lastMessage.content);
//         res.json({ reply });

//     } catch (err) {
//         console.error("BargainBites Aggregator Agent", err);
//         res.status(500).json({
//             error: err.message
//         })
//     }
// })
app.post("/chat", verifyDescopeSession, async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages array required" });
        }

        // Convert to LangChain messages
        const formattedMessages = messages.map((msg) => {
            if (msg.role === "user" || msg.role === "human") {
                return new HumanMessage(msg.content);
            } else if (msg.role === "assistant" || msg.role === "ai") {
                return new AIMessage(msg.content);
            }
            return null;
        }).filter(Boolean);

        if (formattedMessages.length === 0) {
            return res.status(400).json({ error: "No valid messages found" });
        }
        console.log(formattedMessages);

        const result = await aggregatorAgent.invoke({ messages: formattedMessages });

        const lastMessage = result.messages[result.messages.length - 1];
        const reply = typeof lastMessage.content === "string"
            ? lastMessage.content
            : JSON.stringify(lastMessage.content);

        res.json({ reply });
    } catch (err) {
        console.error("BargainBites Aggregator Agent", err);
        res.status(500).json({ error: err.message });
    }
});


//---check BargainBites agent running status
app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "BargainBites Aggregator Agent Server running"
    });
})

//[TEST] route to wake up Restaurant 1 agent server [FIX: Render Service Down Issue]
app.get("/wake-restaurant1", async(req,res)=>{
    try{
        const response = await fetch("https://restaurant1-a2aserver.onrender.com/health");
        const data = await response.json();
        res.json({
            success:true,
            data
        })
    }catch(err){
        console.log("Failed to wake up Restaurant 1 Agent Server");
        res.status(500).json({
            success:false,
            error: err.message
        })
    }
})