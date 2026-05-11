// ============================================
// WellNest v2 — chatbot.js
// FULL WORKING OPENROUTER AI CHATBOT
// ============================================

// -----------------------------
// STORE CHAT HISTORY
// -----------------------------
let chatHistory = [];

// -----------------------------
// OPENROUTER API KEY
// -----------------------------
const API_KEY =
  "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";

// -----------------------------
// SYSTEM PROMPT
// -----------------------------
const SYSTEM_PROMPT = `
You are WellBot, a friendly and supportive AI wellness assistant.

Your role:
- Help users with wellness, sleep, exercise, food, stress, hydration, and mental wellness
- Keep responses short and easy to understand
- Use friendly emojis
- Be supportive and motivational
- Never diagnose diseases
- Suggest seeing a doctor for serious issues
`;

// ============================================
// SEND CHAT MESSAGE
// ============================================
async function sendChat() {

  const input =
    document.getElementById("chat-input");

  const message =
    input.value.trim();

  // Prevent empty messages
  if (!message) return;

  // Clear input
  input.value = "";

  // Show user message
  appendMessage("user", message);

  // Save history
  chatHistory.push({
    role: "user",
    content: message
  });

  // Show typing animation
  const typingId = showTyping();

  try {

    // =====================================
    // API REQUEST
    // =====================================
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${API_KEY}`,

          "Content-Type":
            "application/json",

          "HTTP-Referer":
            window.location.origin,

          "X-Title":
            "WellNest"
        },

        body: JSON.stringify({

          // BEST FREE MODEL
          model: "openai/gpt-4o-mini",

          messages: [

            {
              role: "system",
              content: SYSTEM_PROMPT
            },

            ...chatHistory

          ],

          max_tokens: 300,

          temperature: 0.7
        })
      }
    );

    // Convert response
    const data = await response.json();

    console.log(data);

    // Remove typing animation
    removeTyping(typingId);

    // =====================================
    // SUCCESS RESPONSE
    // =====================================
    if (
      data.choices &&
      data.choices.length > 0
    ) {

      const reply =
        data.choices[0]
        .message.content;

      // Show bot reply
      appendMessage("bot", reply);

      // Save assistant reply
      chatHistory.push({
        role: "assistant",
        content: reply
      });

      // Keep last 20 chats
      if (chatHistory.length > 20) {
        chatHistory =
          chatHistory.slice(-20);
      }

    } else {

      appendMessage(
        "bot",
        "⚠️ Sorry, AI response unavailable right now."
      );
    }

  } catch (error) {

    console.error(error);

    // Remove typing animation
    removeTyping(typingId);

    // Fallback reply
    const fallback =
      getRuleBasedResponse(message);

    appendMessage("bot", fallback);
  }
}

// ============================================
// QUICK QUESTION BUTTONS
// ============================================
function quickAsk(question) {

  document.getElementById(
    "chat-input"
  ).value = question;

  sendChat();
}

// ============================================
// APPEND CHAT MESSAGE
// ============================================
function appendMessage(role, text) {

  const container =
    document.getElementById(
      "chat-messages"
    );

  // Wrapper
  const wrapper =
    document.createElement("div");

  wrapper.className =
    "chat-msg " +
    (
      role === "bot"
        ? "bot-msg"
        : "user-msg"
    );

  // Avatar
  const avatar =
    document.createElement("span");

  avatar.className =
    "chat-avatar";

  avatar.textContent =
    role === "bot"
      ? "🌿"
      : "🙋";

  // Bubble
  const bubble =
    document.createElement("div");

  bubble.className =
    "chat-bubble";

  bubble.innerHTML =
    text.replace(/\n/g, "<br>");

  // Append
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  container.appendChild(wrapper);

  // Auto-scroll
  container.scrollTop =
    container.scrollHeight;
}

// ============================================
// TYPING INDICATOR
// ============================================
function showTyping() {

  const id =
    "typing-" + Date.now();

  const container =
    document.getElementById(
      "chat-messages"
    );

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "chat-msg bot-msg";

  wrapper.id = id;

  wrapper.innerHTML = `
    <span class="chat-avatar">🌿</span>

    <div class="chat-bubble typing-bubble">
      WellBot is thinking... 💭
    </div>
  `;

  container.appendChild(wrapper);

  container.scrollTop =
    container.scrollHeight;

  return id;
}

// ============================================
// REMOVE TYPING
// ============================================
function removeTyping(id) {

  const el =
    document.getElementById(id);

  if (el) {
    el.remove();
  }
}

// ============================================
// OFFLINE FALLBACK RESPONSES
// ============================================
function getRuleBasedResponse(message) {

  const msg =
    message.toLowerCase();

  // Water
  if (
    msg.includes("water") ||
    msg.includes("hydration")
  ) {

    return `
💧 Staying hydrated is important!

Try drinking:
• 2–3 litres daily
• More after exercise
• Keep a bottle nearby 😊
    `;
  }

  // Sleep
  if (
    msg.includes("sleep") ||
    msg.includes("tired")
  ) {

    return `
😴 Better sleep tips:

• Sleep at same time daily
• Avoid phones before bed
• Keep room cool & dark
• Aim for 7–8 hours
    `;
  }

  // Stress
  if (
    msg.includes("stress") ||
    msg.includes("anxiety")
  ) {

    return `
🧘 Stress relief ideas:

• Deep breathing
• Short walks
• Music
• Meditation
• Talk to someone you trust 💚
    `;
  }

  // Exercise
  if (
    msg.includes("exercise") ||
    msg.includes("gym") ||
    msg.includes("workout")
  ) {

    return `
🏋️ Exercise helps both body and mind!

Try:
• Walking
• Strength training
• Stretching
• 30 mins daily movement 😊
    `;
  }

  // Food
  if (
    msg.includes("food") ||
    msg.includes("diet") ||
    msg.includes("protein")
  ) {

    return `
🥗 Healthy eating basics:

• Protein 🍗
• Vegetables 🥦
• Fruits 🍎
• Water 💧
• Balanced meals 🍚
    `;
  }

  // Default
  return `
🌿 I'm here to help with:

• Sleep
• Food
• Stress
• Exercise
• Hydration
• Mental wellness

Ask me anything 😊
  `;
}
