// ============================================
// Pause - Student Well-being App
// Plain JavaScript, no libraries used
// ============================================


// ---------- small helper functions ----------

// get data from localStorage (returns backup value if nothing is saved)
function getData(key, backup) {
  let saved = localStorage.getItem(key);
  if (saved == null) {
    return backup;
  }
  return JSON.parse(saved);
}

// save data to localStorage
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// today's date like "2026-11-22"
function today() {
  return new Date().toISOString().slice(0, 10);
}


// ---------- greeting based on time ----------
let hour = new Date().getHours();
let greeting = document.getElementById("greeting");

if (hour < 12) {
  greeting.textContent = "Good morning";
} else if (hour < 17) {
  greeting.textContent = "Good afternoon";
} else {
  greeting.textContent = "Good evening";
}


// ---------- bottom menu (switch screens) ----------
let navButtons = document.querySelectorAll(".nav button");
let screens = document.querySelectorAll(".screen");

for (let i = 0; i < navButtons.length; i++) {
  navButtons[i].addEventListener("click", function () {

    // hide every screen and un-highlight every button
    for (let j = 0; j < screens.length; j++) {
      screens[j].classList.remove("active");
      navButtons[j].classList.remove("on");
    }

    // show the one that was clicked
    let page = navButtons[i].getAttribute("data-page");
    document.getElementById(page).classList.add("active");
    navButtons[i].classList.add("on");
  });
}


// ---------- mood check-in ----------
let moodData = getData("moodData", {});   // example: { "2026-11-22": 4 }

let moodMessages = {
  5: "Lovely! Hold on to that feeling.",
  4: "Nice. Small good days count.",
  3: "Okay is okay. You're doing enough.",
  2: "Thanks for being honest. Try the Relax tab for a minute.",
  1: "That sounds heavy. You're not alone. You can talk to someone if you want."
};

let moodButtons = document.querySelectorAll(".mood");

// highlight the chosen mood and show a message
function showMood(score) {
  for (let i = 0; i < moodButtons.length; i++) {
    let btnScore = Number(moodButtons[i].getAttribute("data-score"));
    if (btnScore == score) {
      moodButtons[i].classList.add("selected");
    } else {
      moodButtons[i].classList.remove("selected");
    }
  }
  if (score > 0) {
    document.getElementById("moodMessage").textContent = moodMessages[score];
  }
}

for (let i = 0; i < moodButtons.length; i++) {
  moodButtons[i].addEventListener("click", function () {
    let score = Number(moodButtons[i].getAttribute("data-score"));
    moodData[today()] = score;
    saveData("moodData", moodData);
    showMood(score);
    drawChart();
  });
}


// ---------- stress slider ----------
let slider = document.getElementById("stressSlider");

function updateStress() {
  let value = Number(slider.value);
  let label = document.getElementById("stressLabel");
  let tip = document.getElementById("stressTip");

  if (value <= 3) {
    label.textContent = "Calm";
    tip.textContent = "You're in a good place. Keep your routine going.";
  } else if (value <= 6) {
    label.textContent = "Moderate";
    tip.textContent = "A short break may help. Try one minute of breathing.";
  } else {
    label.textContent = "High";
    tip.textContent = "That's a lot. Pause, breathe, and pick one tiny next step.";
  }
  saveData("stress", value);
}

slider.value = getData("stress", 5);
slider.addEventListener("input", updateStress);
updateStress();


// ---------- weekly mood chart ----------
function drawChart() {
  let chart = document.getElementById("chart");
  chart.innerHTML = "";

  let dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  // go from 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    let key = date.toISOString().slice(0, 10);
    let score = moodData[key];

    let box = document.createElement("div");
    box.className = "bar-box";

    let bar = document.createElement("div");
    bar.className = "bar";
    if (score) {
      bar.classList.add("filled");
      bar.style.height = score * 18 + "px";
    } else {
      bar.style.height = "10px";
    }

    let label = document.createElement("small");
    label.textContent = dayNames[date.getDay()];

    box.appendChild(bar);
    box.appendChild(label);
    chart.appendChild(box);
  }
}

showMood(moodData[today()] || 0);
drawChart();


// ---------- breathing exercise ----------
let breathing = false;
let breathTimer;
let orb = document.getElementById("orb");
let orbText = document.getElementById("orbText");
let breatheBtn = document.getElementById("breatheBtn");

function breatheIn() {
  orb.className = "orb in";
  orbText.textContent = "Breathe in";
}

function breatheOut() {
  orb.className = "orb out";
  orbText.textContent = "Breathe out";
}

function stopBreathing() {
  breathing = false;
  clearInterval(breathTimer);
  orb.className = "orb";
  orbText.textContent = "Ready";
  breatheBtn.textContent = "Start 1 minute";
}

breatheBtn.addEventListener("click", function () {
  if (breathing) {
    stopBreathing();
    return;
  }

  breathing = true;
  breatheBtn.textContent = "Stop";
  breatheIn();

  let seconds = 0;
  let isIn = true;

  // changes every 4 seconds, stops after 60 seconds
  breathTimer = setInterval(function () {
    seconds = seconds + 4;
    if (seconds >= 60) {
      stopBreathing();
      orbText.textContent = "Done";
      return;
    }
    if (isIn) {
      breatheOut();
      isIn = false;
    } else {
      breatheIn();
      isIn = true;
    }
  }, 4000);
});


// ---------- grounding exercise (5-4-3-2-1) ----------
let groundSteps = [
  "Name 5 things you can see.",
  "Name 4 things you can touch.",
  "Name 3 things you can hear.",
  "Name 2 things you can smell.",
  "Name 1 thing you can taste.",
  "Well done. Notice how you feel now."
];

let groundIndex = -1;   // -1 means not started
let groundBtn = document.getElementById("groundBtn");
let groundText = document.getElementById("groundText");
let dots = document.querySelectorAll(".dot");

groundBtn.addEventListener("click", function () {
  groundIndex = groundIndex + 1;

  // after the last step, go back to the start
  if (groundIndex >= groundSteps.length) {
    groundIndex = -1;
  }

  if (groundIndex == -1) {
    groundText.textContent = "Tap start and look around you.";
    groundBtn.textContent = "Start";
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("on");
    }
    return;
  }

  groundText.textContent = groundSteps[groundIndex];

  if (groundIndex == groundSteps.length - 1) {
    groundBtn.textContent = "Reset";
  } else {
    groundBtn.textContent = "Next";
  }

  // fill the dots up to the current step
  for (let i = 0; i < dots.length; i++) {
    if (i <= groundIndex) {
      dots[i].classList.add("on");
    } else {
      dots[i].classList.remove("on");
    }
  }
});


// ---------- study / break timer ----------
let minutes = 25;
let timeLeft = 25 * 60;       // in seconds
let timerId = null;

let timerText = document.getElementById("timerText");
let timerBtn = document.getElementById("timerBtn");
let focusBtn = document.getElementById("focusBtn");
let breakBtn = document.getElementById("breakBtn");

function showTime() {
  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;

  // add a 0 in front if it's a single digit
  if (m < 10) { m = "0" + m; }
  if (s < 10) { s = "0" + s; }

  timerText.textContent = m + ":" + s;
}

// switch between focus and break mode
function setMode(mins) {
  clearInterval(timerId);
  timerId = null;
  minutes = mins;
  timeLeft = mins * 60;
  timerBtn.textContent = "Start";
  showTime();
}

focusBtn.addEventListener("click", function () {
  focusBtn.classList.add("on");
  breakBtn.classList.remove("on");
  setMode(25);
});

breakBtn.addEventListener("click", function () {
  breakBtn.classList.add("on");
  focusBtn.classList.remove("on");
  setMode(5);
});

timerBtn.addEventListener("click", function () {
  // if it is running, pause it
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
    timerBtn.textContent = "Resume";
    return;
  }

  timerBtn.textContent = "Pause";
  timerId = setInterval(function () {
    timeLeft = timeLeft - 1;
    showTime();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      timerBtn.textContent = "Start";
      timeLeft = minutes * 60;
      if (minutes == 25) {
        timerText.textContent = "Break time 🌿";
      } else {
        timerText.textContent = "Back when ready";
      }
    }
  }, 1000);
});

showTime();


// ---------- brain dump ----------
let dumpBox = document.getElementById("dumpBox");
let dumpMessage = document.getElementById("dumpMessage");
let chips = document.querySelectorAll(".chip");

// load whatever was saved before
dumpBox.value = getData("dump", "");

// clicking a chip adds that question into the text box
for (let i = 0; i < chips.length; i++) {
  chips[i].addEventListener("click", function () {
    if (dumpBox.value != "") {
      dumpBox.value = dumpBox.value + "\n\n";
    }
    dumpBox.value = dumpBox.value + chips[i].textContent + "\n";
    dumpBox.focus();
  });
}

document.getElementById("clearBtn").addEventListener("click", function () {
  dumpBox.value = "";
  dumpMessage.textContent = "Gone. Feels lighter already.";
});

document.getElementById("saveBtn").addEventListener("click", function () {
  if (dumpBox.value.trim() == "") {
    return;
  }
  saveData("dump", dumpBox.value);
  dumpMessage.textContent = "Kept on this device only.";
});


// ---------- tiny next steps list ----------
let steps = [
  "Drink a glass of water",
  "Write down just 3 tasks for today",
  "Stand up and stretch for 2 minutes",
  "Message a friend: hey, how are you?",
  "Open your notes and study for 10 minutes only"
];

let stepList = document.getElementById("stepList");

for (let i = 0; i < steps.length; i++) {
  let item = document.createElement("li");
  item.textContent = steps[i];

  // tap to tick it off
  item.addEventListener("click", function () {
    item.classList.toggle("done");
  });

  stepList.appendChild(item);
}


// ---------- book a wellness chat ----------
let times = [
  "Today 6 PM", "Today 8 PM", "Tomorrow 10 AM",
  "Tomorrow 2 PM", "Tomorrow 5 PM", "Tomorrow 7 PM"
];

let slotBox = document.getElementById("slotBox");
let bookMessage = document.getElementById("bookMessage");

for (let i = 0; i < times.length; i++) {
  let slot = document.createElement("button");
  slot.className = "slot";
  slot.textContent = times[i];

  slot.addEventListener("click", function () {
    // un-select the others first
    let allSlots = document.querySelectorAll(".slot");
    for (let j = 0; j < allSlots.length; j++) {
      allSlots[j].classList.remove("selected");
    }
    slot.classList.add("selected");
    bookMessage.textContent = "Booked: " + times[i] + ". We'll send a gentle reminder.";
    saveData("booking", times[i]);
  });

  slotBox.appendChild(slot);
}
// ---------- anonymous chat with timetable planner ----------

// ----- normal chat topics -----
let topics = [
  {
    words: ["exam", "test", "marks", "grade", "fail", "result", "study", "assignment", "deadline", "backlog"],
    replies: [
      "Academic pressure is really heavy. You're doing more than you think. Want me to make a study timetable? Just say \"make me a timetable\".",
      "That sounds stressful. Want to pick just one small task for the next 10 minutes?",
      "Marks don't measure your worth. If it helps, I can build a realistic study plan around your free time."
    ]
  },
  {
    words: ["sleep", "tired", "exhausted", "insomnia", "awake", "energy"],
    replies: [
      "Being this tired makes everything feel harder. How many hours have you been getting lately?",
      "Rest matters more than one extra study hour. Could you try switching off screens 30 minutes earlier tonight?"
    ]
  },
  {
    words: ["lonely", "alone", "no friends", "isolated", "left out", "nobody"],
    replies: [
      "Feeling alone is really hard, and a lot of students feel this quietly. I'm glad you said it here.",
      "You're not invisible. Is there one person you could send a small message to today?"
    ]
  },
  {
    words: ["anxious", "anxiety", "panic", "nervous", "scared", "worried", "overthinking", "fear"],
    replies: [
      "That sounds really uncomfortable. Want to try the breathing exercise in the Relax tab for one minute?",
      "Your mind is working overtime. Try naming 5 things you can see right now. It helps calm things down."
    ]
  },
  {
    words: ["parents", "family", "mother", "father", "expectations", "pressure", "compare"],
    replies: [
      "Carrying other people's expectations is tiring. What do YOU want for yourself in this?",
      "It's okay to love your family and still feel stressed by expectations. Do you want to talk about it more?"
    ]
  },
  {
    words: ["sad", "cry", "crying", "down", "low", "hopeless", "empty", "numb"],
    replies: [
      "I'm sorry you're feeling this way. Your feelings are valid. When did it start feeling this heavy?",
      "Thanks for trusting me with that. You don't have to fix anything right now. I'm here."
    ]
  },
  {
    words: ["angry", "frustrated", "annoyed", "irritated", "fed up"],
    replies: [
      "That frustration makes sense. Want to dump it all in the Brain dump tab? Nobody will see it.",
      "It's okay to feel angry. What's been building up?"
    ]
  },
  {
    words: ["thank", "thanks", "helped", "better", "good talk"],
    replies: [
      "I'm really glad. You took a good step by reaching out today.",
      "Anytime. Come back whenever you need a pause."
    ]
  }
];

let crisisWords = ["suicide", "kill myself", "end my life", "want to die", "wanna die", "hurt myself", "self harm", "end it all", "no reason to live"];

let defaultReplies = [
  "I hear you. Tell me a bit more about that.",
  "That sounds like a lot. What's the hardest part of it?",
  "Thanks for sharing. How long have you been feeling this way?",
  "I'm listening. Take your time."
];

let popup = document.getElementById("popup");
let msgs = document.getElementById("msgs");
let chatInput = document.getElementById("chatInput");

function pickOne(list) {
  let index = Math.floor(Math.random() * list.length);
  return list[index];
}

function isCrisis(text) {
  let lower = text.toLowerCase();
  for (let i = 0; i < crisisWords.length; i++) {
    if (lower.includes(crisisWords[i])) {
      return true;
    }
  }
  return false;
}

// normal chat reply
function getReply(userText) {
  let text = userText.toLowerCase();

  if (isCrisis(text)) {
    return "I'm really glad you told me, and I'm concerned about you. You don't have to go through this alone. Please call Tele-MANAS on 14416 (free, 24/7), or tell someone near you right now.";
  }

  let firstWord = text.split(" ")[0];
  if (firstWord == "hi" || firstWord == "hello" || firstWord == "hey") {
    return "Hi, I'm glad you're here. How has your day been?";
  }

  for (let i = 0; i < topics.length; i++) {
    for (let j = 0; j < topics[i].words.length; j++) {
      if (text.includes(topics[i].words[j])) {
        return pickOne(topics[i].replies);
      }
    }
  }

  return pickOne(defaultReplies);
}

function addMessage(text, who) {
  let div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// bot message after a small delay (feels like typing)
function botSay(text) {
  setTimeout(function () {
    addMessage(text, "them");
  }, 900);
}


// ============ TIMETABLE PLANNER ============

let planInfo = {
  active: false,    // true while we are collecting details
  wantFlow: false,  // user asked for a flowchart
  subjects: [],
  days: 0,
  start: -1,        // minutes after midnight
  end: -1,
  hard: []          // subjects that need more time
};
let planReady = false;
let planDays = [];  // the finished timetable

function resetPlan() {
  planInfo.active = false;
  planInfo.wantFlow = false;
  planInfo.subjects = [];
  planInfo.days = 0;
  planInfo.start = -1;
  planInfo.end = -1;
  planInfo.hard = [];
}

// "6pm", "6:30 pm", "18:00" -> minutes after midnight (-1 if not understood)
function toMinutes(text) {
  let m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) {
    return -1;
  }
  let hr = Number(m[1]);
  let min = m[2] ? Number(m[2]) : 0;
  let ap = m[3];
  if (hr > 23 || min > 59) {
    return -1;
  }
  if (ap == "pm" && hr < 12) { hr = hr + 12; }
  if (ap == "am" && hr == 12) { hr = 0; }
  return hr * 60 + min;
}

// minutes -> "6:00 PM"
function formatClock(mins) {
  let h = Math.floor(mins / 60) % 24;
  let m = mins % 60;
  let ap = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 == 0) { h12 = 12; }
  return h12 + ":" + (m < 10 ? "0" + m : m) + " " + ap;
}

function capitalize(text) {
  let words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 0) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
  }
  return words.join(" ");
}

// words we throw away when looking for subject names
let fillerWords = /\b(i|ive|have|my|exams?|tests?|timetables?|time table|schedule|study|plan|flow ?chart|routine|make|create|give|me|a|an|the|please|for|from|in|are|is|subjects?|can|you|need|want|to|of|on|with|days?|hours?|am|pm|tomorrow|next|weeks?|one|two|left|only|just|also|its|it)\b/g;

let ignoreWords = ["yes", "no", "ok", "okay", "hi", "hello", "hey", "thanks", "thank", "sure", "pls", "idk", "hmm"];

// look for days, time window and subjects inside the message
// returns a problem message, or "" if everything is fine
function pullDetails(lower, subjectSource) {
  let problem = "";

  // --- days left ---
  let dayMatch = lower.match(/(\d+)\s*days?/);
  if (dayMatch) {
    planInfo.days = Number(dayMatch[1]);
  } else if (/\btomorrow\b/.test(lower)) {
    planInfo.days = 1;
  } else if (/\b(next week|one week|a week|1 week)\b/.test(lower)) {
    planInfo.days = 7;
  } else if (/\b(two weeks|2 weeks)\b/.test(lower)) {
    planInfo.days = 14;
  } else if (planInfo.days == 0 && planInfo.subjects.length > 0 && /^\s*\d+\s*$/.test(lower)) {
    planInfo.days = Number(lower.trim());
  }

  // --- time window like "6 pm to 10 pm" ---
  let cleaned = lower;
  if (dayMatch) {
    cleaned = cleaned.replace(dayMatch[0], " ");
  }
  let timeMatch = cleaned.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|till|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);

  if (timeMatch) {
    let a = timeMatch[1].trim();
    let b = timeMatch[2].trim();
    let aHas = /am|pm/.test(a);
    let bHas = /am|pm/.test(b);
    let s = toMinutes(a);
    let e = toMinutes(b);

    if (s == -1 || e == -1) {
      problem = "I couldn't read that time. Please write it like 6 pm to 10 pm.";
    } else if (!aHas && !bHas && Math.floor(s / 60) <= 12 && Math.floor(e / 60) <= 12) {
      problem = "Please add am or pm so I get your timing right, like 6 pm to 10 pm.";
    } else {
      // fill in a missing am/pm from the other time
      if (!aHas && bHas) {
        let ap = b.match(/am|pm/)[0];
        let s2 = toMinutes(a + ap);
        if (s2 != -1 && s2 < e) {
          s = s2;
        } else {
          s = toMinutes(a + "am");
        }
      } else if (aHas && !bHas) {
        let ap2 = a.match(/am|pm/)[0];
        let e2 = toMinutes(b + ap2);
        if (e2 != -1 && e2 > s) {
          e = e2;
        } else {
          e = toMinutes(b + (ap2 == "pm" ? "am" : "pm"));
        }
      }
      if (e <= s) {
        e = e + 24 * 60;   // goes past midnight
      }
      planInfo.start = s;
      planInfo.end = e;
    }
  }

  // --- subjects ---
  if (planInfo.subjects.length == 0 && subjectSource != "") {
    let rest = subjectSource;
    if (dayMatch) { rest = rest.replace(dayMatch[0], " "); }
    if (timeMatch) { rest = rest.replace(timeMatch[0], " "); }
    rest = rest.replace(/['.:?!()]/g, "");
    rest = rest.replace(fillerWords, " ");

    let parts = rest.split(/,|;|&|\band\b|\n|\//);
    for (let i = 0; i < parts.length; i++) {
      let w = parts[i].replace(/\s+/g, " ").trim();
      if (w.length < 2 || w.length > 30) { continue; }
      if (/^\d+$/.test(w)) { continue; }
      if (ignoreWords.includes(w)) { continue; }
      if (/\b(know|what|how|why|dont|cant|help)\b/.test(w)) { continue; }
      if (w.split(" ").length > 3) { continue; }
      if (planInfo.subjects.length < 10 && !planInfo.subjects.includes(w)) {
        planInfo.subjects.push(w);
      }
    }
  }

  return problem;
}

// one day's blocks: 50 min study + breaks, all inside start..end
function makeDay(start, end) {
  let items = [];
  let t = start;
  let count = 0;
  while (end - t >= 30) {
    let len = Math.min(50, end - t);
    items.push({ type: "study", from: t, to: t + len, text: "" });
    t = t + len;
    count++;

    // longer break after every 3 blocks
    let breakLen = (count % 3 == 0) ? 30 : 10;
    if (end - t < breakLen + 30) {
      break;   // not enough time left for another block
    }
    items.push({ type: "break", from: t, to: t + breakLen, text: "Break" });
    t = t + breakLen;
  }
  return items;
}

function countStudy(items) {
  let c = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type == "study") { c++; }
  }
  return c;
}

// check what is missing, ask for it, or build the plan
function askOrBuild() {
  let missing = [];
  if (planInfo.subjects.length == 0) {
    missing.push("Your subjects (for example: Maths, Physics, Chemistry)");
  }
  if (planInfo.days == 0) {
    missing.push("How many days are left for your exams (for example: 5 days)");
  }
  if (planInfo.start == -1) {
    missing.push("The time you are free to study each day (for example: 6 pm to 10 pm)");
  }

  if (missing.length > 0) {
    let msg = (missing.length == 3) ? "Sure, I can make that for you! First, tell me:" : "Thanks! I still need:";
    for (let i = 0; i < missing.length; i++) {
      msg = msg + "\n" + (i + 1) + ". " + missing[i];
    }
    botSay(msg);
    return;
  }

  // ---- make sure the plan is realistic ----
  let windowMins = planInfo.end - planInfo.start;

  if (windowMins < 60) {
    planInfo.start = -1;
    planInfo.end = -1;
    botSay("That's less than 1 hour, which is too short for a real plan. Can you give me a longer free time, like 6 pm to 10 pm?");
    return;
  }
  if (windowMins > 12 * 60) {
    planInfo.start = -1;
    planInfo.end = -1;
    botSay("That's more than 12 hours of study a day. That isn't realistic or healthy. Please give me a time window of 12 hours or less.");
    return;
  }
  if (planInfo.days > 30) {
    planInfo.days = 0;
    botSay("That's a long time. Tell me just the next 30 days or fewer and I'll plan it.");
    return;
  }

  let perDay = countStudy(makeDay(planInfo.start, planInfo.end));
  if (perDay * planInfo.days < planInfo.subjects.length) {
    planInfo.days = 0;
    planInfo.start = -1;
    planInfo.end = -1;
    botSay("That's not enough time for " + planInfo.subjects.length + " subjects. With that window I can fit only " + perDay + " study block(s) a day. Please tell me the days and the free time again, with more days or a longer window.");
    return;
  }

  buildAndShow();
}

// build the timetable and show it in the chat
function buildAndShow() {
  planDays = [];
  let n = planInfo.subjects.length;
  let perDay = countStudy(makeDay(planInfo.start, planInfo.end));

  // order of subjects (hard subjects appear twice)
  let order = planInfo.subjects.slice();
  for (let i = 0; i < planInfo.hard.length; i++) {
    order.splice(Math.floor(order.length / 2), 0, planInfo.hard[i]);
  }
  // if there are too few blocks for the extra time, drop it
  if (perDay * planInfo.days < order.length) {
    order = planInfo.subjects.slice();
  }

  // last day is revision only if every subject is covered before it
  let useRevision = planInfo.days >= 3 && (planInfo.days - 1) * perDay >= order.length;

  let idx = 0;
  let revIdx = 0;
  for (let d = 1; d <= planInfo.days; d++) {
    let items = makeDay(planInfo.start, planInfo.end);
    let isRevisionDay = useRevision && d == planInfo.days;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type == "break") {
        continue;
      }
      if (isRevisionDay) {
        items[i].text = "Quick revision: " + capitalize(planInfo.subjects[revIdx % n]);
        revIdx++;
      } else {
        items[i].text = capitalize(order[idx % order.length]);
        idx++;
      }
    }
    planDays.push({
      title: isRevisionDay ? "Day " + d + " (revision day)" : "Day " + d,
      items: items
    });
  }

  planReady = true;
  planInfo.active = false;

  setTimeout(showPlanCard, 900);
  if (planInfo.wantFlow) {
    setTimeout(showFlowCard, 1400);
  }

  let tip = "I kept each study block to 50 minutes with a 10 minute break, and a 30 minute break after every 3 blocks, so it's realistic.";
  if (planInfo.end - planInfo.start > 8 * 60) {
    tip = tip + " Please still sleep 7 to 8 hours.";
  }
  if (planInfo.wantFlow) {
    tip = tip + " Say \"more time for Maths\" if one subject needs extra time.";
  } else {
    tip = tip + " Say \"flowchart\" to see it as a flow, or \"more time for Maths\" to adjust.";
  }
  setTimeout(function () {
    addMessage(tip, "them");
  }, 1900);
}

function showPlanCard() {
  let card = document.createElement("div");
  card.className = "msg them plan";

  let heading = document.createElement("h4");
  heading.textContent = "Your study timetable";
  card.appendChild(heading);

  for (let d = 0; d < planDays.length; d++) {
    let dayTitle = document.createElement("div");
    dayTitle.className = "plan-day";
    dayTitle.textContent = planDays[d].title;
    card.appendChild(dayTitle);

    for (let i = 0; i < planDays[d].items.length; i++) {
      let item = planDays[d].items[i];
      let row = document.createElement("div");
      row.className = "plan-row " + item.type;

      let time = document.createElement("span");
      time.textContent = formatClock(item.from) + " - " + formatClock(item.to);
      let what = document.createElement("span");
      what.textContent = item.text;

      row.appendChild(time);
      row.appendChild(what);
      card.appendChild(row);
    }
  }

  msgs.appendChild(card);
  card.scrollIntoView({ block: "start" });
}

// flowchart of Day 1
function showFlowCard() {
  let day = planDays[0];
  let card = document.createElement("div");
  card.className = "msg them plan";

  let heading = document.createElement("h4");
  heading.textContent = "Flowchart: Day 1";
  card.appendChild(heading);

  function addBox(text, type) {
    let box = document.createElement("div");
    box.className = "flow-box " + type;
    box.textContent = text;
    card.appendChild(box);
  }
  function addArrow() {
    let arrow = document.createElement("div");
    arrow.className = "flow-arrow";
    arrow.textContent = "↓";
    card.appendChild(arrow);
  }

  addBox("Start: " + formatClock(planInfo.start), "end");
  for (let i = 0; i < day.items.length; i++) {
    let item = day.items[i];
    addArrow();
    addBox(item.text + " (" + formatClock(item.from) + " - " + formatClock(item.to) + ")", item.type);
  }
  addArrow();
  addBox("Done: " + formatClock(day.items[day.items.length - 1].to), "end");

  msgs.appendChild(card);
  card.scrollIntoView({ block: "start" });
}

// words that mean the user is chatting about feelings, not answering the planner
let emotionWords = ["sad", "anxious", "tired", "lonely", "stressed", "stress", "scared", "overwhelmed", "cry", "depressed", "hopeless", "worried", "panic", "angry", "hate"];

// returns true if the planner handled the message
function planner(text) {
  let lower = text.toLowerCase();

  // user wants to stop
  if (planInfo.active && /^(cancel|stop|never ?mind|forget it|skip)/.test(lower.trim())) {
    resetPlan();
    botSay("No problem. I'm here whenever you want a plan.");
    return true;
  }

  let wantsPlan = /timetable|time table|schedule|study plan|routine|flow ?chart/.test(lower);

  // changes to a finished plan
  if (planReady && !planInfo.active) {
    let more = lower.match(/more time (?:for|on) (.+)/);
    if (more) {
      let name = more[1].replace(/[.!?]/g, "").trim();
      let found = false;
      for (let i = 0; i < planInfo.subjects.length; i++) {
        if (planInfo.subjects[i].includes(name) || name.includes(planInfo.subjects[i])) {
          planInfo.hard.push(planInfo.subjects[i]);
          found = true;
        }
      }
      if (found) {
        botSay("Done, I'll give that subject extra time.");
        buildAndShow();
      } else {
        botSay("I couldn't find that subject in your plan. Try the exact name, like \"more time for maths\".");
      }
      return true;
    }
    if (/flow ?chart/.test(lower) && !/timetable|time table/.test(lower)) {
      setTimeout(showFlowCard, 900);
      return true;
    }
  }

  let problem = "";

  if (!planInfo.active) {
    // start a new plan only if the user asks for one
    if (!wantsPlan) {
      return false;
    }
    resetPlan();
    planReady = false;
    planInfo.active = true;
    planInfo.wantFlow = /flow ?chart/.test(lower);

    // subjects can come after "for", "subjects" or ":"
    let source = "";
    let m1 = lower.match(/(?:subjects?\s*(?:are|is|:)?|:|\bfor\b)\s*(.+)/);
    if (m1) {
      source = m1[1];
    }
    problem = pullDetails(lower, source);
  } else {
    // already collecting details: let normal feelings chat through
    let hasEmotion = false;
    for (let i = 0; i < emotionWords.length; i++) {
      if (lower.includes(emotionWords[i])) {
        hasEmotion = true;
      }
    }
    if (hasEmotion && !/\d/.test(lower)) {
      return false;
    }
    if (/flow ?chart/.test(lower)) {
      planInfo.wantFlow = true;
    }
    problem = pullDetails(lower, lower);
  }

  if (problem != "") {
    botSay(problem);
    return true;
  }

  askOrBuild();
  return true;
}


// ---------- chat buttons ----------
document.getElementById("chatBtn").addEventListener("click", function () {
  popup.hidden = false;

  if (msgs.children.length == 0) {
    setTimeout(function () {
      addMessage("Hi, I'm glad you reached out. What's on your mind? I can also make you an exam study timetable if you'd like.", "them");
    }, 500);
  }
});

document.getElementById("closeBtn").addEventListener("click", function () {
  popup.hidden = true;
});

document.getElementById("chatForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let text = chatInput.value.trim();
  if (text == "") {
    return;
  }

  addMessage(text, "me");
  chatInput.value = "";

  // serious distress is always checked first
  if (!isCrisis(text)) {
    if (planner(text)) {
      return;
    }
  }

  let reply = getReply(text);
  botSay(reply);
});
