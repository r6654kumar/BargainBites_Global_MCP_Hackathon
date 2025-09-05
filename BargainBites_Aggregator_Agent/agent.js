import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getMCPToolsAsLangGraphTools } from "./restaurant2_mcpToolsWrapper.js";
import dotenv from "dotenv";
dotenv.config();

const mcpTools = await getMCPToolsAsLangGraphTools();
const toolNode = new ToolNode(mcpTools);

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
}).bindTools(mcpTools);

const systemPrompt = `You are the aggregator agent.
You can call restaurant tools (from MCP) to:
- Show menu
- Get offers
- Place orders
- Track orders

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
