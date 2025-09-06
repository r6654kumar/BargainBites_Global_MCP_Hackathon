import express from 'express';
import cors from 'cors';
import { restaurantAgent } from '../Restaurant1_Agent/agent.js';
import { HumanMessage } from '@langchain/core/messages';

const app = express(); // ✅ <-- THIS LINE IS REQUIRED BEFORE app.post()

app.use(cors());
app.use(express.json());

app.post('/agent1', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const pastMessages = (history || []).map(text => new HumanMessage(text));
    const fullConversation = [...pastMessages, new HumanMessage(message)];

    const result = await restaurantAgent.invoke({
      messages: {
        input: fullConversation,
      },
    });

    const lastReply = result?.messages?.output?.at(-1)?.content || '[No response]';
    res.json({ reply: lastReply });

  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: 'Agent failed to respond' });
  }
});

app.listen(3001, () => {
  console.log('✅ Restaurant 1 Agent API running at http://localhost:3001/agent1');
});
