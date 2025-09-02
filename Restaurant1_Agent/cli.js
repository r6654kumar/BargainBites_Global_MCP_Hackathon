import readline from "readline";
import { restaurantAgent } from "./agent.js";
import { HumanMessage } from "@langchain/core/messages";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log("🍽 Restaurant1 LangGraph Agent Ready!");
askQuestion();

function askQuestion() {
  rl.question("You: ", async (input) => {
    try {
      // Create proper message format for MessagesAnnotation
      const messages = [new HumanMessage(input)];
      
      // Invoke the agent with the correct format
      const result = await restaurantAgent.invoke({ messages });
      
      // Extract last message content safely
      const resultMessages = result?.messages ?? [];
      const lastMessage = resultMessages[resultMessages.length - 1];
      const answer = lastMessage?.content ?? "(no response)";
      
      console.log(`🤖 Agent: ${answer}`);
    } catch (err) {
      console.error("⚠️ Error from agent:", err.message);
      console.error("Full error:", err);
    }
    askQuestion();
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});