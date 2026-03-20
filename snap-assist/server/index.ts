import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini SDK
// Note: Requires GEMINI_API_KEY environment variable to be set.
const ai = new GoogleGenAI({});

app.post('/api/analyze', async (req, res) => {
  try {
    const { text, imageBase64, type } = req.body;

    const systemInstruction = `
      You are an emergency triage and instant action AI.
      Analyze the provided multimodal input (which could be an image of a medical issue, a voice note transcript, etc.).
      
      You MUST respond ONLY with a valid JSON object matching this exact schema:
      {
        "priorityBadge": "CRITICAL" | "WARNING" | "INFO",
        "priorityBadgeColor": "red" | "yellow" | "blue",
        "title": "Short recognizable title of the situation",
        "summary": "1-2 sentence description",
        "actionSteps": [
          { "title": "Step title", "detail": "Extended detail" }
        ],
        "quickAction": {
          "label": "e.g. Call 911",
          "intent": "tel:911"
        }
      }
    `;

    const contents: any[] = [];

    // Add text/transcript if present
    if (text) {
      contents.push(text);
    }

    // Add image if present (strip data URI prefix if needed)
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      // Detect mime type from prefix if possible, default to jpeg
      let mimeType = 'image/jpeg';
      if (imageBase64.includes('image/png')) mimeType = 'image/png';
      else if (imageBase64.includes('application/pdf')) mimeType = 'application/pdf';

      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    if (contents.length === 0) {
      return res.status(400).json({ error: "No input provided" });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No text returned from Gemini");
    }
    // Verify it is parseable JSON
    const parsedData = JSON.parse(outputText);

    return res.json(parsedData);

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze input" });
  }
});

// Always serve from the local public folder for consistency across local and URL
const localPublic = path.join(__dirname, 'public');
app.use(express.static(localPublic));

app.get(/.*$/, (req, res) => {
  if (fs.existsSync(path.join(localPublic, 'index.html'))) {
    res.sendFile(path.join(localPublic, 'index.html'));
  } else {
    res.json({ status: 'ok', message: 'SnapAssist API is running' });
  }
});

app.listen(port, () => {
  console.log(`SnapAssist server running on port ${port}`);
});
