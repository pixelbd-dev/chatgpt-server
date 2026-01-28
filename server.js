import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express(); // ✅ THIS WAS MISSING / BROKEN

app.use(cors());
app.use(express.json());

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).send("Remember to breathe 🌿");
});

// ✅ CHAT ENDPOINT
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Say something first 🙂" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are a friendly NPC inside a Roblox game." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data);

    if (!data.choices) {
      return res.json({ reply: "⚠️ AI error, check logs" });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.json({ reply: "Server crashed 😢" });
  }
});

// ✅ PORT (Render requires this)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}


