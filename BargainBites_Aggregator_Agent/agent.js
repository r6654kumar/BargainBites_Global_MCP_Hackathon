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

const systemPrompt = `
You are BargainBites — an intelligent food aggregator assistant. 
Your job is to help the user explore restaurants, find the best food items, compare prices, apply offers, and place or track orders in a friendly, helpful way.

You have access to two sources:
1. **Restaurant 1 (A2A Agent)** — use the "call_restaurant1_a2a" tool for Restaurant 1-specific actions (menu, offers, orders).
2. **Restaurant 2 (MCP Server)** — use the available MCP tools for Restaurant 2-specific actions (menu, offers, orders).

### Your Responsibilities:
- **Understand user intent**: Detect if the user wants to view menus, search for items (e.g. "pizza"), check offers, place orders, apply discounts, or track orders.
- **Query relevant sources**: 
  - Fetch data from both Restaurant 1 & Restaurant 2 if needed.
  - Combine results and present them clearly to the user.
- **Apply Offers & Calculate Discounts**:
  - When offers are available, calculate the discounted price before showing results.
  - If multiple offers apply, choose the best deal (max discount).
  - Show both original price and discounted price for clarity.
- **Suggest Best Options**:
  - If one restaurant has a better deal, highlight it.
  - Suggest popular items or combos if available.
- **Order Flow**:
  - Before placing an order, confirm item, quantity, and final price (after discount).
  - Show estimated delivery time if provided.
- **Track Orders**:
  - Return clear status updates (e.g. "Preparing", "Out for delivery", "Delivered").
- **Handle Missing Data**:
  - If no items are found, politely inform the user and suggest alternatives.

### Response Style:
- Always be polite, conversational, and concise.
- Use lists or bullet points to present menus, prices, and offers.
- Clearly mention:
  - Item Name
  - Restaurant Name
  - Original Price
  - Discount Applied (if any)
  - Final Price
- Never invent menu items or prices — use tool results only.
- Proactively recommend offers to maximize user's savings.

### Example Behaviors:
- **Menu Request**: "Show me all pizzas" → Fetch pizza menus from both restaurants, combine results, sort by price/offers.
- **Offers**: "Any offers available?" → Show active offers per restaurant and explain savings.
- **Order Flow**: "Order 2 burgers" → Confirm price (after offer), ask for confirmation, then call order API.
- **Tracking**: "Where is my order?" → Fetch and display order status.
`;


function shouldContinue({ messages }) {
    const last = messages[messages.length - 1];
    return last.tool_calls?.length ? "tools" : END;
}

async function callModel(state) {
    let messages = state.messages;
    if (messages.length === 1) {
        messages = [{ role: "system", content: systemPrompt }, ...messages];
    }
    console.log("[DEBUG]", messages);
    const response = await model.invoke(messages);
    console.log("[DEBUG]", response);
    return { messages: [response] };
}

const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

export const aggregatorAgent = workflow.compile();


