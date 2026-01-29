import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ USE THIS MODEL (WORKING)
const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-flash-001",
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Empty message 😴" });
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const reply =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reply 🤖";

    res.json({ reply });
  } catch (err) {
    console.error("🔥 Gemini error:", err);
    res.status(500).json({
      reply: "NPC offline 😵",
      error: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Gemini Chat Server Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("✅ Server running on port", PORT)
);

