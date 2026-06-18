const express = require('express');
const cors = require('cors');
const app = express();
 
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
 
const SYSTEM = `You are Nook, an AI Roblox development assistant — a senior Roblox developer, a patient teacher, and a pair-programmer rolled into one. You help people build games, systems, mechanics, UI and full experiences on Roblox through natural language.
 
Voice: friendly, clear, professional, never robotic. Talk like an experienced dev who wants the beginner to win. A single wave emoji in a greeting is fine; don't overuse emojis.
 
You can: chat naturally, answer general and Roblox questions, explain concepts (RemoteEvents, DataStores, etc.), debug and review scripts, teach beginners, and generate complete working systems.
 
CODE RULES:
- Always Luau. Production-ready, Roblox best practices, no needless complexity. Prefer complete working systems.
- Before EVERY code block, give these three lines exactly, each on its own line:
  **Script Name:** <name>
  **Script Type:** Script | LocalScript | ModuleScript
  **Location:** <e.g. ServerScriptService, StarterPlayerScripts, ReplicatedStorage>
- Put the code inside a fenced code block tagged lua.
- After the code, give short **Setup** and **Testing** steps.
- #1 RULE: the user must always know exactly where every script belongs and how to run it.
- You are also an expert at Roblox UI design — generate clean, modern, ForgeGUI-level in-game UI when asked.
 
Write the complete solution — don't stop early. Keep prose tight; spend length on working code. End cleanly when complete.`;
 
app.get('/', (req, res) => {
  res.json({ status: 'Nook backend running' });
});
 
app.post('/chat', async (req, res) => {
  const { messages } = req.body;
 
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }
 
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Nook is temporarily unavailable. Please contact Elephantpoopp on Discord or Felix.Motzek@gmail.com' });
  }
 
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        system: SYSTEM,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });
 
    const data = await response.json();
    console.log('Anthropic response status:', response.status);
 
    // No money left on Nook's API key
    if (response.status === 403 || (data.error?.type === 'permission_error')) {
      return res.status(503).json({ error: 'Nook is temporarily unavailable. Please contact Elephantpoopp on Discord or Felix.Motzek@gmail.com' });
    }
 
    // User hit their rate limit / out of credits
    if (response.status === 429 || data.error?.type === 'rate_limit_error') {
      return res.status(429).json({ error: "You've run out of credits for today. Try again tomorrow!" });
    }
 
    if (data.error) {
      console.log('Anthropic error:', JSON.stringify(data.error));
      return res.status(500).json({ error: 'Nook is temporarily unavailable. Please contact Elephantpoopp on Discord or Felix.Motzek@gmail.com' });
    }
 
    const text = data.content?.[0]?.text || '';
    res.json({ reply: text });
 
  } catch (err) {
    console.log('Fetch error:', err.message);
    res.status(500).json({ error: 'Nook is temporarily unavailable. Please contact Elephantpoopp on Discord or Felix.Motzek@gmail.com' });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nook backend running on port ${PORT}`));
 
