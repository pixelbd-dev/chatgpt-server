import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Health check (Render wake-up)
app.get("/", (req, res) => {
  res.send("Server alive ✅");
});

// 🔹 Chat endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({ reply: "Say something 😅" });
  }

  try {
    // ⏱️ Timeout guard (Roblox-safe)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "You are a friendly NPC inside a Roblox game. Keep replies short." },
            { role: "user", content: userMessage }
          ],
          max_tokens: 120
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Hmm… I don't know what to say 🤔";

    res.json({ reply });

  } catch (err) {
    console.error("❌ OpenAI error:", err.message);

    // 🔥 Fallback reply (NO timeout to Roblox)
    res.json({
      reply: "Sorry, I can't think right now 😅"
    });
  }
});

// 🔥 Render REQUIRED port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
