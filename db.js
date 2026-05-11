// ============================================
//   WellNest v2 — db.js
//   This file handles ALL data storage.
//   We use localStorage (built into the browser)
//   as our "database" — no server needed!
// ============================================

// ─────────────────────────────────────────────
//  HOW IT WORKS (Easy Explanation):
//  localStorage stores data as KEY → VALUE pairs.
//  We store:
//    "wn_users"       → list of all registered users
//    "wn_session"     → currently logged-in username
//    "wn_data_[user]" → each user's personal health data
// ─────────────────────────────────────────────

// ── Helper: get all users from storage
function getAllUsers() {
  return JSON.parse(localStorage.getItem("wn_users") || "[]");
}

// ── Helper: save users list back to storage
function saveAllUsers(users) {
  localStorage.setItem("wn_users", JSON.stringify(users));
}

// ── Register a new user
// Returns: { ok: true } or { ok: false, msg: "..." }
function dbRegister(name, username, password) {
  if (!name || !username || !password) {
    return { ok: false, msg: "Please fill in all fields." };
  }
  if (password.length < 4) {
    return { ok: false, msg: "Password must be at least 4 characters." };
  }

  const users = getAllUsers();
  const exists = users.find(u => u.username === username);

  if (exists) {
    return { ok: false, msg: "Username already taken. Try another!" };
  }

  // Save the new user
  users.push({ name, username, password });
  saveAllUsers(users);

  // Create empty data store for this user
  const today = getTodayKey();
  const emptyData = {
    name,
    streak: 0,
    lastActiveDay: today,
    days: {} // each day will have water, mood, habits, journal
  };
  localStorage.setItem("wn_data_" + username, JSON.stringify(emptyData));

  return { ok: true };
}

// ── Login an existing user
// Returns: { ok: true, user } or { ok: false, msg }
function dbLogin(username, password) {
  const users = getAllUsers();
  const user  = users.find(u => u.username === username);

  if (!user) {
    return { ok: false, msg: "Username not found. Please register!" };
  }
  if (user.password !== password) {
    return { ok: false, msg: "Wrong password. Try again!" };
  }

  // Save session
  localStorage.setItem("wn_session", username);
  return { ok: true, user };
}

// ── Logout
function dbLogout() {
  localStorage.removeItem("wn_session");
}

// ── Get logged-in username (null if not logged in)
function dbGetSession() {
  return localStorage.getItem("wn_session");
}

// ── Get user's full data object
function dbGetUserData(username) {
  const raw = localStorage.getItem("wn_data_" + username);
  if (!raw) return null;
  return JSON.parse(raw);
}

// ── Save user's full data object
function dbSaveUserData(username, data) {
  localStorage.setItem("wn_data_" + username, JSON.stringify(data));
}

// ── Get today's date as a string key like "2025-01-15"
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

// ── Get or create today's entry for a user
function dbGetToday(username) {
  const data  = dbGetUserData(username);
  const today = getTodayKey();

  // If no entry for today, create one
  if (!data.days[today]) {
    data.days[today] = {
      water:   0,          // number of glasses
      mood:    null,       // string like "😊 Good"
      habits:  [],         // array of completed habit names
      journal: ""          // gratitude journal text
    };
    dbSaveUserData(username, data);
  }

  return data.days[today];
}

// ── Save today's data for a user
function dbSaveToday(username, todayData) {
  const data  = dbGetUserData(username);
  const today = getTodayKey();
  data.days[today] = todayData;

  // Update streak
  data.streak = calculateStreak(data.days);
  data.lastActiveDay = today;

  dbSaveUserData(username, data);
}

// ── Calculate streak (consecutive days with any activity)
function calculateStreak(days) {
  const keys  = Object.keys(days).sort().reverse(); // newest first
  if (keys.length === 0) return 0;

  let streak = 0;
  let current = new Date();

  for (let i = 0; i < 30; i++) { // check last 30 days
    const key = current.toISOString().split("T")[0];
    if (days[key] && (days[key].water > 0 || days[key].mood || days[key].habits.length > 0)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (i === 0) {
      // Today might not have activity yet, skip to yesterday
      current.setDate(current.getDate() - 1);
    } else {
      break; // streak broken
    }
  }

  return streak;
}

// ── Get last 7 days of mood history for a user
function dbGetMoodHistory(username) {
  const data = dbGetUserData(username);
  if (!data) return [];

  const history = [];
  const current = new Date();

  for (let i = 0; i < 7; i++) {
    const key  = current.toISOString().split("T")[0];
    const entry = data.days[key];
    if (entry && entry.mood) {
      history.push({ date: key, mood: entry.mood });
    }
    current.setDate(current.getDate() - 1);
  }

  return history;
}

// ── Format date nicely like "Jan 15"
function formatDate(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
