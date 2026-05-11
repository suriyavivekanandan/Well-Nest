// ============================================
//   WellNest v2 — chatbot.js
//   AI Wellness Chatbot using Claude API
//   (Free — uses Anthropic's built-in endpoint)
// ============================================

// ─────────────────────────────────────────────
//  HOW IT WORKS:
//  1. User types a message and clicks Send
//  2. We call the Claude AI API (claude-sonnet-4-20250514)
//  3. Claude responds as a wellness assistant
//  4. The reply appears in the chat window
// ─────────────────────────────────────────────

// Stores full chat history so AI remembers context
let chatHistory = [];

// The system prompt tells Claude how to behave
const SYSTEM_PROMPT = `You are WellBot, a friendly and caring AI wellness assistant for WellNest — a health and wellness app designed for students and intermediate-level learners.

Your role:
- Answer questions about physical health, mental health, nutrition, sleep, hydration, exercise, and stress management
- Give simple, practical, encouraging advice
- Be warm, supportive, and easy to understand (no complicated medical jargon)
- Keep responses concise (3–5 sentences max unless a detailed explanation is needed)
- Use emojis to make responses friendly 😊
- If someone seems stressed or sad, be empathetic and suggest helpful coping strategies
- Never diagnose medical conditions. Always suggest consulting a doctor for serious concerns.
- Always stay on the topic of health and wellness.`;

// ─────────────────────────────────────────────
// SEND A CHAT MESSAGE
// ─────────────────────────────────────────────
async function sendChat() {
  const input   = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  // Clear input
  input.value = "";

  // Show user message in chat
  appendMessage("user", message);

  // Add to history
  chatHistory.push({ role: "user", content: message });

  // Show typing indicator
  const typingId = showTyping();

  try {
    // ── Call Claude API ──
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // Note: The API key is handled automatically by the WellNest environment
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system:     SYSTEM_PROMPT,
        messages:   chatHistory  // send full history for context
      })
    });

    const data = await response.json();

    // Remove typing indicator
    removeTyping(typingId);

    if (data.content && data.content[0]) {
      const reply = data.content[0].text;

      // Show bot reply
      appendMessage("bot", reply);

      // Add to history so Claude remembers this conversation
      chatHistory.push({ role: "assistant", content: reply });

      // Keep history reasonable (last 20 messages)
      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(-20);
      }

    } else {
      // API returned an error
      removeTyping(typingId);
      appendMessage("bot", "Sorry, I couldn't get a response right now. Please try again! 🙏");
    }

  } catch (error) {
    removeTyping(typingId);
    // Fallback to rule-based response if API fails
    const fallback = getRuleBasedResponse(message);
    appendMessage("bot", fallback);
    console.error("API Error:", error);
  }
}

// ─────────────────────────────────────────────
// QUICK QUESTION SHORTCUT
// ─────────────────────────────────────────────
function quickAsk(question) {
  document.getElementById("chat-input").value = question;
  sendChat();
}

// ─────────────────────────────────────────────
// DISPLAY A MESSAGE IN CHAT WINDOW
// ─────────────────────────────────────────────
function appendMessage(role, text) {
  const container = document.getElementById("chat-messages");

  const wrapper = document.createElement("div");
  wrapper.className = "chat-msg " + (role === "bot" ? "bot-msg" : "user-msg");

  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = role === "bot" ? "🌿" : "🙋";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  // Convert newlines to <br> for nice formatting
  bubble.innerHTML = text.replace(/\n/g, "<br>");

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// ─────────────────────────────────────────────
// TYPING INDICATOR (shows "..." while waiting)
// ─────────────────────────────────────────────
function showTyping() {
  const id = "typing-" + Date.now();
  const container = document.getElementById("chat-messages");

  const wrapper = document.createElement("div");
  wrapper.className = "chat-msg bot-msg";
  wrapper.id = id;

  wrapper.innerHTML = `
    <span class="chat-avatar">🌿</span>
    <div class="chat-bubble typing-bubble">WellBot is thinking… 💭</div>
  `;

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─────────────────────────────────────────────
// FALLBACK: RULE-BASED RESPONSES
// Used if the API is unavailable
// ─────────────────────────────────────────────
function getRuleBasedResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes("water") || msg.includes("hydrat")) {
    return "💧 Staying hydrated is super important! Aim for 8 glasses (about 2 litres) of water per day. Try keeping a water bottle nearby as a reminder!";
  }
  if (msg.includes("sleep") || msg.includes("tired") || msg.includes("rest")) {
    return "😴 Quality sleep is everything! Try to sleep and wake up at the same time every day. Avoid screens 30 minutes before bed and keep your room cool and dark.";
  }
  if (msg.includes("stress") || msg.includes("anxious") || msg.includes("anxiety") || msg.includes("worry")) {
    return "🧘 It's okay to feel stressed sometimes. Try box breathing: inhale 4 seconds, hold 4, exhale 4, hold 4. Also, talking to someone you trust helps a lot!";
  }
  if (msg.includes("exercise") || msg.includes("workout") || msg.includes("gym") || msg.includes("walk")) {
    return "🚶 Even a 20–30 minute walk every day makes a huge difference! You don't need a gym — dancing, cycling, or yoga at home all count!";
  }
  if (msg.includes("food") || msg.includes("diet") || msg.includes("eat") || msg.includes("breakfast")) {
    return "🥗 A balanced meal has: protein (eggs, dal, chicken), carbs (rice, roti), veggies, and healthy fats. Never skip breakfast — it kickstarts your metabolism!";
  }
  if (msg.includes("mental health") || msg.includes("sad") || msg.includes("depressed") || msg.includes("lonely")) {
    return "💚 Your mental health matters so much. It's brave to talk about how you feel. Try journaling, connecting with a friend, or speaking with a school counsellor. You're not alone! 🌿";
  }
  if (msg.includes("mood") || msg.includes("happy") || msg.includes("feel")) {
    return "😊 Mood is heavily influenced by sleep, food, exercise, and social connection. Try going outside for sunlight and fresh air — it works wonders!";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hi there! 👋 I'm WellBot, your AI wellness buddy. Ask me anything about health, sleep, stress, food, or mental wellness!";
  }

  return "🌿 Great question! For the best advice, try asking me about specific topics like sleep, water, exercise, stress, or mental health. I'm here to help!";
}
