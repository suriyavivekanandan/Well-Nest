// ============================================
// WellNest v2 — chatbot.js
// FINAL SECURE VERSION
// ============================================

// ============================================
// STORE CHAT HISTORY
// ============================================
let chatHistory = [];

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
    document.getElementById(
      "chat-input"
    );

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

  // Show typing
  const typingId = showTyping();

  try {

    // =====================================
    // CALL YOUR BACKEND
    // =====================================
    const response = await fetch(
      "https://well-nest-backend.onrender.com/chat",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
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
    // SUCCESS
    // =====================================
    if (
      data.choices &&
      data.choices.length > 0
    ) {

      const reply =
        data.choices[0]
        .message.content;

      // Show AI reply
      appendMessage("bot", reply);

      // Save history
      chatHistory.push({
        role: "assistant",
        content: reply
      });

      // Limit memory
      if (chatHistory.length > 20) {

        chatHistory =
          chatHistory.slice(-20);
      }

    } else {

      console.log(data);

      appendMessage(
        "bot",
        "⚠️ AI response unavailable."
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

  // Add
  wrapper.appendChild(avatar);

  wrapper.appendChild(bubble);

  container.appendChild(wrapper);

  // Auto-scroll
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
// FALLBACK RESPONSES
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
🧘 Stress relief ideas:

• Deep breathing
• Walking
• Meditation
• Talk to someone 💚
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
