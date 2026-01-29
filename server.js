import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // ✅ REQUIRED

const app = express();
app.use(cors()); // ✅ Roblox-safe
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.json({ reply: "Say something 🙂" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.json({ reply: "NPC is resting 😴" });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "🤔 ...";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "NPC offline 😴" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});




