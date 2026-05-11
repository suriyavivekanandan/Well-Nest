// ============================================
// WellNest v2 — chatbot.js
// FINAL WORKING OPENROUTER CHATBOT
// ============================================

// Chat history
let chatHistory = [];

// ============================================
// API KEY
// ============================================
const API_KEY =
  "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";
// ============================================
// SYSTEM PROMPT
// ============================================
const SYSTEM_PROMPT = `
You are WellBot, a friendly AI wellness assistant.

Rules:
- Help users with sleep, stress, exercise, food, hydration, and wellness
- Keep answers short and supportive
- Use emojis
- Never diagnose diseases
- Encourage healthy habits
`;

// ============================================
// SEND CHAT
// ============================================
async function sendChat() {

  const input =
    document.getElementById("chat-input");

  const message =
    input.value.trim();

  // Empty check
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

  // Typing animation
  const typingId = showTyping();

  try {

    // =====================================
    // OPENROUTER REQUEST
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
            "https://suriyavivekanandan.github.io",

          "X-Title":
            "WellNest"

        },

        body: JSON.stringify({

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

    // Remove typing
    removeTyping(typingId);

    // =====================================
    // CHECK RESPONSE
    // =====================================
    if (
      data.choices &&
      data.choices.length > 0
    ) {

      const reply =
        data.choices[0]
        .message.content;

      // Show bot message
      appendMessage("bot", reply);

      // Save reply
      chatHistory.push({
        role: "assistant",
        content: reply
      });

      // Keep only last 20 chats
      if (chatHistory.length > 20) {

        chatHistory =
          chatHistory.slice(-20);
      }

    } else {

      console.log(data);

      appendMessage(
        "bot",
        "⚠️ AI did not return a response."
      );
    }

  } catch (error) {

    console.error(error);

    removeTyping(typingId);

    // Offline fallback
    const fallback =
      getRuleBasedResponse(message);

    appendMessage("bot", fallback);
  }
}

// ============================================
// QUICK ASK
// ============================================
function quickAsk(question) {

  document.getElementById(
    "chat-input"
  ).value = question;

  sendChat();
}

// ============================================
// APPEND MESSAGE
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

  // Add elements
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  container.appendChild(wrapper);

  // Auto scroll
  container.scrollTop =
    container.scrollHeight;
}

// ============================================
// SHOW TYPING
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
// OFFLINE FALLBACK
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
💧 Drink 2–3 litres of water daily.
Hydration improves energy and focus!
    `;
  }

  // Sleep
  if (
    msg.includes("sleep") ||
    msg.includes("tired")
  ) {

    return `
😴 Sleep tips:

• Sleep same time daily
• Avoid screens before bed
• Aim for 7–8 hours
    `;
  }

  // Stress
  if (
    msg.includes("stress") ||
    msg.includes("anxiety")
  ) {

    return `
🧘 Try:

• Deep breathing
• Walking
• Meditation
• Talking to someone 💚
    `;
  }

  // Exercise
  if (
    msg.includes("exercise") ||
    msg.includes("gym")
  ) {

    return `
🏋️ Daily movement improves health!

Try:
• Walking
• Strength training
• Stretching
    `;
  }

  // Food
  if (
    msg.includes("food") ||
    msg.includes("diet")
  ) {

    return `
🥗 Eat balanced meals:

• Protein
• Vegetables
• Fruits
• Healthy carbs
    `;
  }

  // Default
  return `
🌿 Ask me about:

• Sleep
• Food
• Stress
• Exercise
• Hydration
• Wellness 😊
  `;
}
