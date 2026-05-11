// ============================================
//   WellNest v2 — app.js
//   Main app: Auth, Tips, Water, Habits,
//   Mental Health, Quiz
// ============================================

// ─────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────
let currentUser = null; // username of logged-in user

// ─────────────────────────────────────────────
// 1. AUTH — REGISTER / LOGIN / LOGOUT
// ─────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("register-form").classList.toggle("hidden", tab !== "register");
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
}

function registerUser() {
  const name     = document.getElementById("reg-name").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const msg      = document.getElementById("reg-msg");

  const result = dbRegister(name, username, password);

  if (result.ok) {
    msg.style.color = "var(--green)";
    msg.textContent = "✅ Account created! Logging you in...";
    setTimeout(() => loginAfterRegister(username, password), 800);
  } else {
    msg.style.color = "var(--red)";
    msg.textContent = result.msg;
  }
}

function loginAfterRegister(username, password) {
  const result = dbLogin(username, password);
  if (result.ok) launchApp(username);
}

function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const msg      = document.getElementById("login-msg");

  const result = dbLogin(username, password);

  if (result.ok) {
    msg.style.color = "var(--green)";
    msg.textContent = "✅ Welcome back!";
    setTimeout(() => launchApp(username), 500);
  } else {
    msg.style.color = "var(--red)";
    msg.textContent = result.msg;
  }
}

function logoutUser() {
  dbLogout();
  currentUser = null;
  document.getElementById("app-wrapper").classList.add("hidden");
  document.getElementById("auth-overlay").classList.remove("hidden");
  // Clear inputs
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("login-msg").textContent = "";
}

// ── Launch the app after successful login
function launchApp(username) {
  currentUser = username;
  document.getElementById("auth-overlay").classList.add("hidden");
  document.getElementById("app-wrapper").classList.remove("hidden");

  const data = dbGetUserData(username);
  const displayName = data ? data.name : username;

  document.getElementById("welcome-msg").textContent = "Hi, " + displayName + "!";
  document.getElementById("hero-name").textContent   = displayName.split(" ")[0];

  // Load all sections
  renderTips();
  renderGlasses();
  renderHabits();
  renderMoodHistory();
  renderQuestion();
  updateDashboard();
}

// ─────────────────────────────────────────────
// 2. DASHBOARD SUMMARY
// ─────────────────────────────────────────────
function updateDashboard() {
  if (!currentUser) return;

  const today = dbGetToday(currentUser);
  const data  = dbGetUserData(currentUser);

  document.getElementById("dash-water").textContent  = today.water + " / 8 glasses";
  document.getElementById("dash-mood").textContent   = today.mood || "Not logged";
  document.getElementById("dash-habits").textContent = today.habits.length + " habit" + (today.habits.length !== 1 ? "s" : "");
  document.getElementById("dash-streak").textContent = (data.streak || 0) + " day" + (data.streak !== 1 ? "s" : "");
}

// ─────────────────────────────────────────────
// 3. WELLNESS TIPS
// ─────────────────────────────────────────────
const tips = [
  { icon:"💧", title:"Drink More Water",    text:"Aim for 8 glasses daily. Staying hydrated boosts energy, skin, and focus." },
  { icon:"🚶", title:"Walk Every Day",       text:"A 30-minute walk improves mood, heart health, and reduces stress naturally." },
  { icon:"😴", title:"Sleep 7–9 Hours",      text:"Quality sleep is the #1 habit for a healthy body and a sharp mind." },
  { icon:"🥗", title:"Eat More Greens",      text:"Include vegetables and fruits in every meal. They fuel your body with real nutrients." },
  { icon:"📵", title:"Screen Break",         text:"Every 1 hour, look away from your screen for 20 seconds to protect your eyes." },
  { icon:"🧘", title:"Practice Breathing",   text:"Deep breathing for 5 minutes lowers anxiety and brings instant calm." },
  { icon:"🎵", title:"Listen to Music",      text:"Uplifting music can reduce stress hormones and improve your overall mood." },
  { icon:"📓", title:"Journaling",           text:"Write 3 things you're grateful for each day to build a positive mindset." },
  { icon:"☀️", title:"Get Sunlight",         text:"10–15 minutes of morning sunlight helps regulate your sleep cycle and mood." },
  { icon:"🤝", title:"Connect with People",  text:"Social connections are key to mental health. Call a friend today!" }
];

function renderTips() {
  const grid = document.getElementById("tips-grid");
  grid.innerHTML = "";
  tips.forEach((tip, i) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    card.style.animationDelay = i * 0.07 + "s";
    card.innerHTML = `<div class="tip-icon">${tip.icon}</div><h3>${tip.title}</h3><p>${tip.text}</p>`;
    grid.appendChild(card);
  });
}

// ─────────────────────────────────────────────
// 4. WATER TRACKER
// ─────────────────────────────────────────────
function renderGlasses() {
  if (!currentUser) return;
  const today   = dbGetToday(currentUser);
  const count   = today.water;
  const container = document.getElementById("glasses-container");
  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const g = document.createElement("span");
    g.className = "glass" + (i < count ? " filled" : "");
    g.textContent = "🥤";
    g.title = "Glass " + (i + 1);
    g.addEventListener("click", () => toggleGlass(i));
    container.appendChild(g);
  }

  document.getElementById("tracker-status").innerHTML =
    `You've had <strong>${count}</strong> of 8 glasses today.` +
    (count >= 8 ? " 🎉 Goal reached!" : "");

  updateDashboard();
}

function toggleGlass(index) {
  const today = dbGetToday(currentUser);
  today.water = (index < today.water) ? index : index + 1;
  dbSaveToday(currentUser, today);
  renderGlasses();
}

document.getElementById("reset-btn").addEventListener("click", () => {
  const today = dbGetToday(currentUser);
  today.water = 0;
  dbSaveToday(currentUser, today);
  renderGlasses();
});

// ─────────────────────────────────────────────
// 5. HABIT TRACKER
// ─────────────────────────────────────────────
const habitList = [
  { icon:"🚶", name:"30-min walk or exercise" },
  { icon:"💧", name:"Drink 8 glasses of water" },
  { icon:"🥗", name:"Eat fruits or vegetables" },
  { icon:"📵", name:"Limit screen time" },
  { icon:"😴", name:"Sleep before 11 PM" },
  { icon:"🧘", name:"5-min breathing or meditation" },
  { icon:"📓", name:"Write in gratitude journal" },
];

function renderHabits() {
  if (!currentUser) return;
  const today = dbGetToday(currentUser);
  const list  = document.getElementById("habit-list");
  list.innerHTML = "";

  habitList.forEach(habit => {
    const done = today.habits.includes(habit.name);
    const item = document.createElement("div");
    item.className = "habit-item" + (done ? " done" : "");
    item.innerHTML = `
      <div class="habit-check">${done ? "✓" : ""}</div>
      <span class="habit-icon">${habit.icon}</span>
      <span class="habit-name">${habit.name}</span>
    `;
    item.addEventListener("click", () => toggleHabit(habit.name));
    list.appendChild(item);
  });

  updateDashboard();
}

function toggleHabit(name) {
  const today = dbGetToday(currentUser);
  const idx   = today.habits.indexOf(name);
  if (idx === -1) {
    today.habits.push(name);
  } else {
    today.habits.splice(idx, 1);
  }
  dbSaveToday(currentUser, today);
  renderHabits();
}

// ─────────────────────────────────────────────
// 6. MENTAL HEALTH — MOOD LOGGER
// ─────────────────────────────────────────────
function logMood(moodText) {
  const today = dbGetToday(currentUser);
  today.mood  = moodText;
  dbSaveToday(currentUser, today);

  // Update button styles
  document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mood === moodText);
  });

  document.getElementById("mood-saved").textContent = "✅ Mood saved: " + moodText;
  updateDashboard();
  renderMoodHistory();
}

// Restore mood selection on page load
function restoreMood() {
  if (!currentUser) return;
  const today = dbGetToday(currentUser);
  if (today.mood) {
    document.querySelectorAll(".mood-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mood === today.mood);
    });
    document.getElementById("mood-saved").textContent = "✅ Mood saved: " + today.mood;
  }
}

function renderMoodHistory() {
  if (!currentUser) return;
  const history = dbGetMoodHistory(currentUser);
  const list    = document.getElementById("mood-history-list");
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = '<p style="color:var(--gray);font-size:.9rem">No mood entries yet. Start logging above!</p>';
    return;
  }

  history.forEach(entry => {
    const div = document.createElement("div");
    div.className = "mood-entry";
    div.innerHTML = `<span>${entry.mood}</span><span class="mood-date">${formatDate(entry.date)}</span>`;
    list.appendChild(div);
  });
}

// ─────────────────────────────────────────────
// 7. BREATHING EXERCISE
// ─────────────────────────────────────────────
let breathingTimer = null;

function startBreathing() {
  document.getElementById("breathing-overlay").classList.remove("hidden");
  const phases = [
    { text: "Breathe In…",  duration: 4000 },
    { text: "Hold…",        duration: 4000 },
    { text: "Breathe Out…", duration: 4000 },
    { text: "Hold…",        duration: 4000 },
  ];
  let phase = 0;

  function nextPhase() {
    document.getElementById("breathing-text").textContent = phases[phase].text;
    phase = (phase + 1) % phases.length;
    breathingTimer = setTimeout(nextPhase, phases[phase].duration);
  }

  nextPhase();
}

function stopBreathing() {
  clearTimeout(breathingTimer);
  document.getElementById("breathing-overlay").classList.add("hidden");
}

// ─────────────────────────────────────────────
// 8. GRATITUDE JOURNAL
// ─────────────────────────────────────────────
function saveJournal() {
  if (!currentUser) return;
  const text  = document.getElementById("journal-input").value.trim();
  if (!text) { alert("Please write something first!"); return; }

  const today = dbGetToday(currentUser);
  today.journal = text;
  dbSaveToday(currentUser, today);

  alert("✅ Journal saved! Keep it up 🌿");
}

// Restore journal text on load
function restoreJournal() {
  if (!currentUser) return;
  const today = dbGetToday(currentUser);
  if (today.journal) {
    document.getElementById("journal-input").value = today.journal;
  }
}

// ─────────────────────────────────────────────
// 9. WELLNESS QUIZ
// ─────────────────────────────────────────────
const questions = [
  {
    q:"How many glasses of water do you drink per day?",
    options:["Less than 3","3–5 glasses","6–7 glasses","8+ glasses"],
    scores:[0,1,2,3]
  },
  {
    q:"How many hours do you sleep each night?",
    options:["Less than 5 hrs","5–6 hrs","7–8 hrs","9+ hrs"],
    scores:[0,1,3,2]
  },
  {
    q:"How often do you exercise or move your body?",
    options:["Rarely / Never","1–2 times a week","3–4 times a week","Every day"],
    scores:[0,1,2,3]
  },
  {
    q:"How would you describe your diet?",
    options:["Mostly junk food","Mixed","Mostly healthy","Very clean & nutritious"],
    scores:[0,1,2,3]
  },
  {
    q:"How do you feel emotionally most of the time?",
    options:["Stressed & anxious","Mostly okay","Happy & calm","Excellent & energized"],
    scores:[0,1,2,3]
  }
];

let currentQ = 0;
let selectedAnswers = new Array(questions.length).fill(null);

function renderQuestion() {
  const block = document.getElementById("question-block");
  const q = questions[currentQ];

  block.innerHTML = `
    <p style="color:var(--green-light);font-size:.88rem;margin-bottom:8px">
      Question ${currentQ + 1} of ${questions.length}
    </p>
    <h3>${q.q}</h3>
    <div class="options">
      ${q.options.map((opt, i) => `
        <button class="option-btn ${selectedAnswers[currentQ] === i ? "selected" : ""}"
                onclick="selectAnswer(${i})">${opt}</button>
      `).join("")}
    </div>
  `;

  document.getElementById("prev-btn").disabled = currentQ === 0;
  document.getElementById("next-btn").textContent =
    currentQ === questions.length - 1 ? "See Result 🎯" : "Next →";
}

function selectAnswer(index) {
  selectedAnswers[currentQ] = index;
  renderQuestion();
}

document.getElementById("next-btn").addEventListener("click", () => {
  if (selectedAnswers[currentQ] === null) { alert("Please select an answer!"); return; }
  if (currentQ < questions.length - 1) { currentQ++; renderQuestion(); }
  else showResult();
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
});

function showResult() {
  let total = 0;
  selectedAnswers.forEach((ans, i) => { if (ans !== null) total += questions[i].scores[ans]; });
  const percent = Math.round((total / 15) * 100);

  let emoji, message;
  if      (percent >= 80) { emoji = "🌟"; message = "Excellent! You have great wellness habits. Keep it up!"; }
  else if (percent >= 55) { emoji = "😊"; message = "Good job! A few small improvements can make a big difference."; }
  else if (percent >= 30) { emoji = "🌱"; message = "You're on the right track. Start with one new habit today!"; }
  else                    { emoji = "💪"; message = "Every expert was once a beginner. Start small and keep going!"; }

  document.getElementById("question-block").style.display = "none";
  document.getElementById("quiz-nav").style.display       = "none";

  const result = document.getElementById("quiz-result");
  result.classList.remove("hidden");
  result.innerHTML = `
    <span class="score-big">${emoji} ${percent}%</span>
    <strong>Your Wellness Score</strong>
    <p style="margin-top:12px;color:var(--text)">${message}</p>
    <button class="btn btn-outline" style="margin-top:18px" onclick="resetQuiz()">Try Again 🔄</button>
  `;
}

function resetQuiz() {
  currentQ = 0;
  selectedAnswers = new Array(questions.length).fill(null);
  document.getElementById("question-block").style.display = "block";
  document.getElementById("quiz-nav").style.display       = "flex";
  document.getElementById("quiz-result").classList.add("hidden");
  renderQuestion();
}

// ─────────────────────────────────────────────
// 10. HAMBURGER MENU (Mobile)
// ─────────────────────────────────────────────
document.getElementById("hamburger").addEventListener("click", () => {
  const nav = document.querySelector(".nav-links");
  if (nav.style.display === "flex") {
    nav.style.display = "none";
  } else {
    Object.assign(nav.style, {
      display:"flex", flexDirection:"column",
      position:"absolute", top:"64px", left:"0", right:"0",
      background:"white", padding:"20px 30px",
      boxShadow:"0 8px 24px rgba(0,0,0,.08)", zIndex:"99"
    });
  }
});

// ─────────────────────────────────────────────
// 11. AUTO-LOGIN (if session exists)
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const session = dbGetSession();
  if (session) {
    launchApp(session);
  }
  // After launch, restore today's data into UI
  setTimeout(() => {
    if (currentUser) {
      restoreMood();
      restoreJournal();
    }
  }, 100);
});
