import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { aggregatorAgent } from "./agent.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import cors from "cors";
const app = express();
app.use(express.json());
const PORT = 8000;

//---------cors enabled
app.use(cors({
    origin: "*", // Allow all origins, or specify your frontend URL like "http://localhost:3000"
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


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
app.post("/chat", async (req, res) => {
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