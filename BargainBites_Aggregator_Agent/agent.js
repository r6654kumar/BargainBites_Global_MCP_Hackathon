import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getMCPToolsAsLangGraphTools } from "./restaurant2_mcpToolsWrapper.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

// A2A Client Function
export async function callA2AAgent(message) {
    const agentUrl = "https://restaurant1-a2aserver.onrender.com";
    
    const requestPayload = {
        contextId: uuidv4(),
        message: {
            parts: [{ kind: "text", text: message }]
        },
        messageId: uuidv4(),
        role: "user"
    };

    try {
        console.log(`[A2A] Calling Restaurant1 A2A agent...`);
        
        const response = await fetch(`${agentUrl}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            throw new Error(`A2A request failed: ${response.status}`);
        }

        const result = await response.json();
        
        // Extract text from A2A response
        let responseText = "No response received";
        if (result.parts && result.parts.length > 0) {
            responseText = result.parts
                .filter(part => part.kind === "text")
                .map(part => part.text)
                .join(" ");
        }

        return responseText;

    } catch (error) {
        console.error(`[A2A] Error:`, error);
        throw new Error(`Failed to communicate with Restaurant1: ${error.message}`);
    }
}

// Create A2A Tool
const a2aRestaurant1Tool = tool(
    async ({ message }) => {
        try {
            const response = await callA2AAgent(message);
            return `Restaurant1 Response: ${response}`;
        } catch (error) {
            return `Restaurant1 Error: ${error.message}`;
        }
    },
    {
        name: "call_restaurant1_a2a",
        description: "Call Restaurant1 via A2A protocol for menu, orders, offers, and tracking",
        schema: z.object({
            message: z.string().describe("Message to send to Restaurant1")
        })
    }
);

// Get MCP tools and add A2A tool
const mcpTools = await getMCPToolsAsLangGraphTools();
const allTools = [...mcpTools, a2aRestaurant1Tool];
const toolNode = new ToolNode(allTools);

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
}).bindTools(allTools);

const systemPrompt = `You are the aggregator agent.
You can call restaurant tools (from MCP) to:
- Show menu
- Get offers
- Place orders
- Track orders

You also have access to Restaurant1 via A2A:
- call_restaurant1_a2a - For Restaurant1 requests

Your job is to intelligently use these tools based on user's requests.
Always be polite and conversational.`;

function shouldContinue({ messages }) {
    const last = messages[messages.length - 1];
    return last.tool_calls?.length ? "tools" : END;
}

async function callModel(state) {
    let messages = state.messages;
    if (messages.length === 1) {
        messages = [{ role: "system", content: systemPrompt }, ...messages];
    }
    console.log("[DEBUG]",messages);
    const response = await model.invoke(messages);
    console.log("[DEBUG]",response);
    return { messages: [response] };
}

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

export const aggregatorAgent = workflow.compile();


