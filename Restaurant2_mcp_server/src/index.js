import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";

const API_BASE_URL = 'https://bargainbites-global-mcp-hackathon.onrender.com';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('mcp-debug.log', logMessage);
  console.error(message);
}

export default function createServer() {
   const server = new Server(
    {
      name: "Restaurant2_MCP_Server",
      version: "1.0.0",
    }, {
    capabilities: {
      tools: {}
    }
  })
  // const server = new Server({
  //   name: "Restaurant2_MCP_Server",
  //   version: "1.0.0",
  // }, {
  //   capabilities: {
  //     tools: {}
  //   }
  // });

  log("Server created");

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("Tools list requested");
    return {
      tools: [
        {
          name: "restaurant2_explore_menu",
          description: "Find all food items available in the restaurant",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "restaurant2_place_order",
          description: "Place a new food order",
          inputSchema: {
            type: "object",
            properties: {
              customer_name: { type: "string", description: "Customer's full name" },
              customer_phone: { type: "string", description: "Customer's phone number" },
              item_name: { type: "string", description: "Name of the food item" },
              quantity: { type: "integer", minimum: 1, description: "Quantity of the food item" },
            },
            required: ["customer_name", "customer_phone", "item_name", "quantity"]
          },
        },
        {
          name: "restaurant2_track_order",
          description: "Track the status of your order using order id and phone number",
          inputSchema: {
            type: "object",
            properties: {
              orderId: { type: "string", description: "Order id" },
              customer_phone: { type: "string", description: "Customer's phone number" }
            },
            required: ["orderID", "customer_phone"]
          },
        },
        {
          name: "restaurant2_explore_offers",
          description: "Explore all the offers availabe at the Restaurant on ordering food and give details to the customer",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "restaurant2_detailed_offer_by_id",
          description: "Explore in detail about a specific order by the offer id, give details to the user about the offer & check whether the offer is applicable on present order list or not & calculate the price after applying the offer, also provide alternative offers to user.",
          inputSchema: {
            type: "object",
            properties: { offerId: { type: "string", description: "Order id" } },
          },
          required: ["offerId"]
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    log(`Tool called: ${request.params.name}`);
    log(`Tool args: ${JSON.stringify(request.params.arguments)}`);

    const { name, arguments: args } = request.params;

    if (name === "restaurant2_explore_menu") {
      log("=== MENU TOOL CALLED ===");

      try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        const data = await response.json();

        if (data.success) {
          const menuText = data.menuItems.map(item =>
            `• ${item.name} - $${item.price} (${item.category})`
          ).join('\n');

          log("Menu tool successful");
          return {
            content: [
              {
                type: "text",
                text: `Restaurant Menu:\n\n${menuText}\n\n Total available items: ${data.menuItems.length}`
              }
            ]
          };
        } else {
          log("Menu API returned failure");
          return {
            content: [
              {
                type: "text",
                text: "Failed to fetch menu items from the restaurant"
              }
            ]
          };
        }
      } catch (error) {
        log(`Menu tool error: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: `Error fetching menu: ${error.message}`
            }
          ]
        };
      }
    }

    if (name === "restaurant2_place_order") {
      log("=== ORDER TOOL CALLED ===");

      try {
        const orderData = {
          customer_name: args.customer_name,
          customer_phone: args.customer_phone,
          item_name: args.item_name,
          quantity: args.quantity
        };

        log(`Sending to API: ${JSON.stringify(orderData)}`);

        const response = await fetch(`${API_BASE_URL}/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();
        log(`API Response: ${JSON.stringify(data)}`);

        if (response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Order placed successfully!\nOrder ID: ${data.order_id}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Failed to place order: ${data.error || "Unknown error"}`
              }
            ]
          };
        }
      } catch (error) {
        log(`Error in place_order tool: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: `Failed to place order: ${error.message}`
            }
          ]
        };
      }
    }

    if (name === "restaurant2_track_order") {
      log("=== ORDER Status TOOL CALLED ===");

      try {
        // const orderStatus = {
        //   orderId: args.orderId,
        //   customer_phone: args.customer_phone,
        // };

        // log(`Sending to API: ${JSON.stringify()}`);

        const response = await fetch(`${API_BASE_URL}/order/${args.orderId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          // body: JSON.stringify(orderData)
        });

        const data = await response.json();
        log(`API Response: ${JSON.stringify(data)}`);

        if (response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Order status fetched successfully!\nOrder Status: ${data.status}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch order status: ${data.error || "Unknown error"}`
              }
            ]
          };
        }
      } catch (error) {
        log(`Error in track_order tool: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch order status: ${error.message}`
            }
          ]
        };
      }
    }
    if (name === "restaurant2_explore_offers") {
      log("=== Tool to display all offers to user choosed ===");

      try {
        const response = await fetch(`${API_BASE_URL}/offers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          // body: JSON.stringify(orderData)
        });

        const data = await response.json();
        log(`API Response: ${JSON.stringify(data)}`);

        if (response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `All offers fetched successfully!: ${JSON.stringify(data)}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch offers: ${data.error || "Unknown error"}`
              }
            ]
          };
        }
      } catch (error) {
        log(`Error in offers tool: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch offers: ${error.message}`
            }
          ]
        };
      }
    }
    if (name === "restaurant2_detailed_offer_by_id") {
      log("=== Tool to display offer details by id called ===");

      try {
        const response = await fetch(`${API_BASE_URL}/offers/${args.offerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          // body: JSON.stringify(orderData)
        });

        const data = await response.json();
        log(`API Response: ${JSON.stringify(data)}`);

        if (response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Offer details fetched successfully!\nOffer Details: ${JSON.stringify(data)}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch offer details: ${data.error || "Unknown error"}`
              }
            ]
          };
        }
      } catch (error) {
        log(`Error in offer details tool: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch offer details: ${error.message}`
            }
          ]
        };
      }
    }


    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Unknown tool: ${name}`
        }
      ]
    };
  });

  log("Tools registered");
  return server;
}

async function main() {
  log("Starting server...");
  // const transport = new StdioServerTransport();
  // await server.connect(transport);
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Restaurant2 Menu MCP Server running...");
}

// main().catch((error) => {
//   log(`Server error: ${error.message}`);
//   console.error(error);
//   process.exit(1);
// });
  main().catch((error) => {
    log(`Server error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
