import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {  StateGraph, MessagesAnnotation, START, END} from "@langchain/langgraph";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getMenu } from "./services/menuService.js";
import { placeOrder, trackOrder } from "./services/orderService.js";
import { getAllOfferDetails, getOfferDetailsById } from "./services/offerService.js";
import yaml from 'yaml';
import fs from 'fs';
import dotenv from 'dotenv';
// import { RunCommand } from "@langchain/langgraph/dist/graph/command.js";
 import { AIMessage,HumanMessage } from "@langchain/core/messages";
 
 

dotenv.config();  

const configFile = fs.readFileSync('../Restaurant1_Agent/restaurant-system-config.yaml', 'utf8');
const systemConfig = yaml.parse(configFile);

const buildSystemPrompt = (config) => {
  const { restaurant_assistant } = config;
  
  return `You are a ${restaurant_assistant.role}. ${restaurant_assistant.primary_goal}

## CRITICAL WORKFLOW RULES:

### For ANY pricing inquiry or order interest:
1. **ALWAYS call getMenu FIRST** to check what's actually available
2. **THEN call getOffers** to check current promotions  
3. **Calculate and present ALL requested scenarios** with clear comparisons
4. **Only attempt orders AFTER user confirms their choice**

### For order placement:
1. **Verify item exists in menu before attempting placeOrder**
2. **Check placeOrder response for errors** - never claim success if tool failed
3. **If order fails, immediately suggest available alternatives**

### Error Handling (CRITICAL):
- **ALWAYS check tool responses for errors before responding**
- **If placeOrder fails, acknowledge the specific error**  
- **Immediately suggest alternatives from the actual menu**
- **Never claim order success when tool returned an error**

### Context Memory:
- **Remember customer details within the conversation**
- **Reference previous interactions naturally**
- **Don't forget what just happened**

## Core Tools Available:
- **getMenu**: Shows current available items (CALL FIRST for any order inquiry)
- **getOffers**: Shows current promotions (CALL for pricing scenarios)
- **getOfferDetails**: Detailed offer analysis  
- **placeOrder**: Places order (CHECK RESPONSE for errors!)
- **trackOrder**: Track existing orders

## Response Pattern for Pricing Scenarios:
When customer asks "what will be my total for X items before/after offers":

1. Call getMenu to check availability
2. Call getOffers to see promotions
3. Calculate regular pricing
4. Calculate with applicable offers  
5. Present clear comparison table
6. Ask if they want to proceed

Example Response Format:
"""
Let me check our current menu and offers for you!

**Menu Check:** ✅ {item_name} is available at{price}

**Your Pricing Scenarios:**
📊 **Regular Price**: 3x {item_name} = {total_regular}
📊 **With {offer_name}**: {total_with_offer} (Save {savings}!)

Would you like me to place this order?
"""

## Error Recovery Pattern:
When tool fails:
"""
I apologize - {specific_error_reason}. 

Here's what I can offer instead:
{list_available_alternatives}

Would you like to try one of these options instead?
"""

## Personality Traits:
${restaurant_assistant.personality_traits?.map(trait => `- ${trait}`).join('\n')}

## SUCCESS CRITERIA:
- Never claim order success when tool failed
- Always check menu before attempting orders
- Present offer scenarios proactively  
- Maintain context throughout conversation
- Provide alternatives when requests fail

Remember: Be proactive about offers, transparent about errors, and always verify tool responses!`;
};
const systemPrompt = buildSystemPrompt(systemConfig);

const restaurantTools = [
  new DynamicStructuredTool({
    name: "getMenu",
    description: "Get the current restaurant menu - ALWAYS call this first before any order attempts",
    schema: z.object({}),
    func: async () => {
      try {
        const result = await getMenu();
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  }),
  new DynamicStructuredTool({
    name: "getOffers", 
    description: "Get all current offers - call this when customer asks about pricing or deals",
    schema: z.object({}),
    func: async () => {
      try {
        const result = await getAllOfferDetails();
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  }),
  new DynamicStructuredTool({
    name: "getOfferDetails",
    description: "Get detailed information about a specific offer by ID",
    schema: z.object({
      offerId: z.string().describe("The ID of the offer to get details for"),
    }),
    func: async ({ offerId }) => {
      try {
        const result = await getOfferDetailsById(offerId);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  }),
  new DynamicStructuredTool({
    name: "placeOrder",
    description: "Place order ONLY after verifying item availability. Always check response for errors!",
    schema: z.object({
      customer_name: z.string().describe("Customer's full name"),
      customer_phone: z.string().describe("Customer's phone number"),
      item_name: z.string().describe("EXACT name of food item from menu"),
      quantity: z.number().describe("Quantity to order")
    }),
    func: async ({ customer_name, customer_phone, item_name, quantity }) => {
      try {
        const result = await placeOrder({ customer_name, customer_phone, item_name, quantity });
        return { 
          success: true, 
          data: result,
          customer_name,
          customer_phone,
          item_name,
          quantity
        };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.error || error.message,
          customer_name,
          customer_phone,
          item_name,
          quantity
        };
      }
    },
  }),
  new DynamicStructuredTool({
    name: "trackOrder",
    description: "Track order status using order ID and customer phone",
    schema: z.object({
      orderId: z.string().describe("The order ID to track"),
      customer_phone: z.string().describe("Customer's phone number")
    }),
    func: async ({ orderId, customer_phone }) => {
      try {
        const result = await trackOrder({ orderId, customer_phone });
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  }),
];

const toolNode = new ToolNode(restaurantTools);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: "AIzaSyCQT6vGh3zG6nO0O88SK_DnggmWU8u4oio"
}).bindTools(restaurantTools);

function shouldContinue({ messages }) {
  const lastMessage = messages[messages.length - 1];
  return lastMessage.tool_calls?.length ? "tools" : END;
}

async function callModel(state) {


  
let messages = state.messages;


  if (messages.length === 1) {
    messages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
  }

  

  const response = await model.invoke(messages);
  //return { messages: [response] };
  
if (Array.isArray(response.content)) {
    return {
      messages: [
        new AIMessage("", { additional_kwargs: { tool_calls: response.content } })
      ]
    };
  }

  // Otherwise normal text response
  return {
    messages: [
      new AIMessage(response.content)
    ]
  };


}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);



export const restaurantAgent = workflow.compile();
export { systemConfig };






