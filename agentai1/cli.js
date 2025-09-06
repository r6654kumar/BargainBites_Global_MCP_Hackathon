import readlineSync from 'readline-sync';
import { runLLMAgent } from './services/openai.js';
import { getMenuFromRestaurant2, placeOrderRestaurant2 } from './services/restaurant2.js';
import { restaurantAgent } from '../Restaurant1_Agent/agent.js';
import { HumanMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';
dotenv.config();

async function queryRestaurant1(food) {
  const messages = [new HumanMessage(`I want to order ${food}`)];
  const result = await restaurantAgent.invoke({ messages });
  const lastMessage = result.messages[result.messages.length - 1];
  return {
    source: 'res1',
    price: extractPrice(lastMessage.content),
    offer: extractOffer(lastMessage.content),
    rawResponse: lastMessage.content
  };
}

function extractPrice(text) {
  const match = text.match(/₹(\d+)/);
  return match ? parseInt(match[1], 10) : 9999;
}

function extractOffer(text) {
  const match = text.match(/offer: ([^\n]+)/i);
  return match ? match[1] : "No clear offer found";
}

async function main() {
  console.log("Agent1: Hello, how can I help you?");
  const userInput = readlineSync.question("Customer: ");
  const response = await runLLMAgent(userInput);

  if (response.intent !== 'order') {
    console.log("Agent1:", response.reply);
    return;
  }

  console.log("Agent1: Checking with restaurants...");

  const [res1, res2] = await Promise.all([
    queryRestaurant1(response.food),
    getMenuFromRestaurant2(response.food)
  ]);

  const better = res1.price < res2.price ? res1 : { ...res2, source: 'res2' };
  console.log(`Agent1: I found ${better.source} has ${response.food} at ₹${better.price} with offer: ${better.offer}`);

  const confirm = readlineSync.question("Customer: ");
  if (!confirm.toLowerCase().includes("order")) {
    console.log("Agent1: No problem. Let me know if you need anything else.");
    return;
  }

  const name = readlineSync.question("Agent1: Please provide your name: ");
  const mobile = readlineSync.question("Agent1: Please provide your mobile number: ");

  if (better.source === 'res1') {
    const messages = [new HumanMessage(
      `Please place an order for ${response.food} in the name of ${name}, phone ${mobile}`
    )];
    const res = await restaurantAgent.invoke({ messages });
    const last = res.messages[res.messages.length - 1];
    console.log("Agent1:", last.content);
  } else {
    const result = await placeOrderRestaurant2({ food: response.food, name, mobile });
    if (result.success) {
      console.log(`Agent1: Your order is placed with reference ID ${result.referenceId}`);
    } else {
      console.log("Agent1: Failed to place order.");
    }
  }
}

main();
