import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Key check kora dorkar
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message pathao 😴" });
    }

    // ✅ FIXED: models/ prefix add kora hoyeche jate 404 error na ashe
    // Free API-te ei model-ti sobcheye bhalo kaj kore
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error);
    
    // Detailed error message response e pathano hocche jate tumi dekhte paro
    res.status(500).json({
      reply: "NPC offline 😵",
      error: error.message,
    });
  }
});

// Server check endpoint
app.get("/", (req, res) => {
  res.send("✅ Gemini Server is Running and Ready!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});