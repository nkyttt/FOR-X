import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'CYBERX Master Gaming Platform',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Tactical Mastermind & Game Analyst endpoint (Gemini 3.1 Pro Preview with HIGH Thinking)
app.post('/api/ai/tactical-advisor', async (req, res) => {
  try {
    const { prompt, gameTitle, userRank, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the CYBERX Tactical Mastermind and AI Game Analyst, an ultra-advanced esports strategist, game theory expert, and meta analyzer for the CYBERX Gaming Platform.
You provide elite tactical breakdowns, frame-perfect timing guides, loadout optimizations, tournament scouting reports, and counter-play strategies.
When analyzing a query:
1. Break down the meta dynamics and tactical considerations.
2. Provide concrete, actionable step-by-step guidance, loadout recommendations, or positioning maps.
3. Include pro-level advice, key timings, and contingency plans.
Format your responses with clear headings, bullet points, and high-impact cyber-themed formatting.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Game: ${gameTitle || 'CYBERX Universe'} | User Rank/Level: ${userRank || 'Pro Challenger'} | Context: ${context || 'Esports Strategy'}\n\nQuery:\n${prompt}`,
          },
        ],
      },
    ];

    // Explicitly requested: gemini-3.1-pro-preview with thinkingLevel HIGH and do NOT set maxOutputTokens
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction,
      },
    });

    const candidate = response.candidates?.[0];
    const replyText = candidate?.content?.parts?.map((p) => p.text).join('\n') || 'Tactical analysis completed.';

    return res.json({
      success: true,
      analysis: replyText,
      model: 'gemini-3.1-pro-preview',
      thinkingMode: 'HIGH',
    });
  } catch (error: any) {
    console.error('Error generating AI tactical advice:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate AI tactical analysis',
      fallback: 'CYBERX Tactical AI is calculating offline strategies: Focus on crosshair placement at head level, control high ground choke points, manage cooldown economy, and communicate callouts with your squad.',
    });
  }
});

// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CYBERX Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
