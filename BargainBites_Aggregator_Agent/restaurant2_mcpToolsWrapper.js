import dotenv from "dotenv";
dotenv.config();

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
const serverUrl = process.env.SMITHERY_API_KEY;
const transport = new StreamableHTTPClientTransport(serverUrl);

const client = new Client({
    name: "Aggregator",
    version: "1.0.0",
});

await client.connect(transport);
export async function getMCPToolsAsLangGraphTools() {
    const toolData = await client.listTools();
    const toolsArray = Array.isArray(toolData)
        ? toolData
        : toolData.tools || Object.values(toolData);

    return toolsArray.map((tool) => {
        return new DynamicStructuredTool({
            name: tool.name,
            description: tool.description || "MCP tool",
            schema: z.object(
                Object.fromEntries(
                    Object.entries(tool.inputSchema?.properties || {}).map(([key, param]) => [
                        key,
                        (tool.inputSchema?.required || []).includes(key)
                            ? z.string()
                            : z.string().optional(),
                    ])
                )
            ),
            func: async (args) => {
                try {
                    const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

                    const result = await client.callTool({
                        name: tool.name,
                        arguments: parsedArgs || {}
                    });

                    return result.content || result;
                } catch (error) {
                    console.error(`Error calling tool ${tool.name}:`, error);
                    throw error;
                }
            },
        });
    });
}

// async function testTools() {
//     try {
//         const langGraphTools = await getMCPToolsAsLangGraphTools();
//         console.log(`Converted ${langGraphTools.length} MCP tools to LangGraph tools:`);
//         langGraphTools.forEach((t) => console.log(`- ${t.name}`));

//         const menuTool = langGraphTools.find(t => t.name.includes("explore_menu"));

//         if (!menuTool) {
//             console.error("Menu tool not found!");
//             console.log("Available tools:", langGraphTools.map(t => t.name));
//             return;
//         }

//         console.log("\nTesting menu tool...");
//         const menuResult = await menuTool.func({});
//         console.log("Menu tool output:", JSON.stringify(menuResult, null, 2));

//     } catch (error) {
//         console.error("Error in testTools:", error);
//     }
// }

// async function directTest() {
//     try {
//         console.log("Testing direct MCP client call...");

//         const tools = await client.listTools();
//         console.log("Available tools:", tools);

//         const menuTool = tools.tools?.find(t => t.name.includes("explore_menu")) ||
//             tools.find?.(t => t.name.includes("explore_menu"));

//         if (!menuTool) {
//             console.error("Menu tool not found in available tools");
//             return;
//         }

//         console.log("Found menu tool:", menuTool.name);
//         const result = await client.callTool({
//             name: menuTool.name,
//             arguments: {}
//         });

//         console.log("Direct call result:", JSON.stringify(result, null, 2));

//     } catch (error) {
//         console.error("Error in direct test:", error);
//     }
// }

// // Run tests
// // await testTools();
// // console.log("\n" + "=".repeat(50) + "\n");
// // await directTest();