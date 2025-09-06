import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();
import { restaurantAgent } from "./agent.js";

import {
  DefaultRequestHandler,
  InMemoryTaskStore,
} from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";

const restaurant1Card = {
  name: "Restaurant1 Agent",
  description: "LangGraph-based restaurant assistant for Restaurant 1",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: process.env.RESTAURANT1_A2A_URL || "http://localhost:3001",
  skills: [
    {
      id: "chat",
      name: "Chat",
      description:
        "Handles menu lookup, offers, order placement, and tracking for Restaurant 1",
      tags: ["restaurant", "chat"],
    },
  ],
  capabilities: ["text"],
  defaultInputModes: ["text"],
};

class Restaurant1Executor {
  async execute(requestContext, eventBus) {
    try {
      console.log("Received A2A request:", JSON.stringify(requestContext, null, 2));

      const userMessage = requestContext.message.parts
        .map((p) => (p.kind === "text" ? p.text : ""))
        .join(" ");

      console.log(`Received A2A message: ${userMessage}`);

      if (!userMessage.trim()) {
        throw new Error("Empty message received");
      }

      const langGraphInput = {
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      };

      console.log("Invoking LangGraph agent...");
      const result = await restaurantAgent.invoke(langGraphInput);
      let responseText = "Sorry, couldn't process that.";

      if (result.messages && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];
        if (typeof lastMessage.content === 'string') {
          responseText = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          responseText = lastMessage.content
            .map((item) => {
              if (typeof item === 'string') return item;
              if (item.type === 'text') return item.text;
              return '';
            })
            .join('');
        } else if (lastMessage.content && typeof lastMessage.content === 'object') {
          responseText = lastMessage.content.text || JSON.stringify(lastMessage.content);
        }
      }

      console.log(`LangGraph response: ${responseText}`);

      const response = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: responseText }],
        contextId: requestContext.contextId,
      };

      eventBus.publish(response);
      eventBus.finished();

      console.log("A2A response sent successfully");

    } catch (err) {
      console.error("Error in Restaurant1Executor:", err);
      const errorResponse = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{
          kind: "text",
          text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
        }],
        contextId: requestContext.contextId,
      };

      eventBus.publish(errorResponse);
      eventBus.error(err instanceof Error ? err : new Error(String(err)));
    }
  }

  async cancelTask(taskId) {
    console.log(`Cancel requested for task ${taskId}`);
  }
}

const executor = new Restaurant1Executor();
const handler = new DefaultRequestHandler(
  restaurant1Card,
  new InMemoryTaskStore(),
  executor
);

// Create Express app first
const expressApp = express();

// Add middleware for JSON parsing
expressApp.use(express.json({ limit: '10mb' }));

// Add debugging middleware
expressApp.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Try to create A2A app - but handle errors gracefully
let app;
try {
  console.log("Setting up A2A routes...");
  const a2aApp = new A2AExpressApp(handler);
  app = a2aApp.setupRoutes(expressApp);
  console.log("A2A routes setup successful");
} catch (error) {
  console.log("A2A setup failed, using fallback:", error.message);
  app = expressApp; // Use plain Express app
}

// Safe route debugging
try {
  if (app && app._router && app._router.stack) {
    console.log("Available A2A routes:");
    app._router.stack.forEach(function (r) {
      if (r.route && r.route.path) {
        console.log(`  ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
      }
    });
  } else {
    console.log("A2A routes not accessible - using manual endpoints");
  }
} catch (err) {
  console.log("Route debugging skipped:", err.message);
}

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agent: restaurant1Card.name
  });
});

// Add manual agent card endpoint
app.get('/.well-known/agent.json', (req, res) => {
  console.log("Agent card requested");
  res.json(restaurant1Card);
});

// Manual execute endpoint as primary endpoint
app.post('/execute', async (req, res) => {
  console.log("Manual /execute endpoint hit");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const requestContext = req.body;

    if (!requestContext.message) {
      return res.status(400).json({ error: "Missing message in request" });
    }

    // Create a mock event bus for testing
    const responses = [];
    let finished = false;

    const mockEventBus = {
      publish: (response) => {
        responses.push(response);
        console.log("EventBus publish:", JSON.stringify(response, null, 2));
      },
      finished: () => {
        console.log("EventBus finished");
        finished = true;
        // Send the response
        if (responses.length > 0) {
          res.json(responses[0]);
        } else {
          res.status(500).json({ error: "No response generated" });
        }
      },
      error: (err) => {
        console.log("EventBus error:", err);
        finished = true;
        res.status(500).json({ error: err.message });
      }
    };

    await executor.execute(requestContext, mockEventBus);

    // Safety timeout in case finished() doesn't get called
    setTimeout(() => {
      if (!finished) {
        console.log("Timeout - forcing response");
        finished = true;
        if (responses.length > 0) {
          res.json(responses[0]);
        } else {
          res.status(500).json({ error: "Response timeout" });
        }
      }
    }, 30000); // 30 second timeout

  } catch (error) {
    console.error("Manual execute error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test the LangGraph agent directly
app.post('/test-langgraph', async (req, res) => {
  console.log("Direct LangGraph test endpoint hit");
  try {
    const userMessage = req.body.message || "Hello, show me the menu";

    const langGraphInput = {
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    };

    // console.log("Testing LangGraph with:", JSON.stringify(langGraphInput, null, 2));
    const result = await restaurantAgent.invoke(langGraphInput);

    console.log("LangGraph result:", JSON.stringify(result, null, 2));
    res.json({
      success: true,
      input: langGraphInput,
      output: result
    });

  } catch (error) {
    console.error("LangGraph test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`\n Restaurant1 A2A Server running at http://localhost:${PORT}`);
  console.log(`Agent Card: ${restaurant1Card.name}`);
  console.log(` A2A URL: ${restaurant1Card.url}`);
  console.log(`\n Available endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`   - GET  http://localhost:${PORT}/.well-known/agent.json`);
  console.log(`   - POST http://localhost:${PORT}/execute`);
  console.log(`   - POST http://localhost:${PORT}/test-langgraph`);
  console.log(`\n Server ready for testing!`);
});