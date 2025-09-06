import readline from "readline";
import { aggregatorAgent } from "./agent.js";
import { HumanMessage } from "@langchain/core/messages";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let agent = null;

async function initializeAgent() {
  try {
    console.log("Initializing Aggregator Agent...");
    agent = await aggregatorAgent;
    console.log("Aggregator Agent Ready! (Connected to Restaurant 2 MCP)");
    ask();
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    process.exit(1);
  }
}

function ask() {
  rl.question("You: ", async (input) => {
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log("Goodbye!");
      rl.close();
      process.exit(0);
    }

    try {
      console.log("\n--- Processing your request ---");
      
      const response = await agent.invoke({
        messages: [new HumanMessage(input)]  
      });

      const lastMessage = response.messages[response.messages.length - 1];
      console.log(`\nBargainBites: ${lastMessage.content}`);
      console.log("\n" + "=".repeat(50));
      
    } catch (err) {
      console.error("\nError:", err.message);
      console.error("Stack:", err.stack);
    }
    
    ask(); 
  });
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log("\n\nGoodbye!");
  rl.close();
  process.exit(0);
});

// Initialize the agent
initializeAgent();