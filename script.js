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


// ---------- anonymous chat (pretend replies for the prototype) ----------
let replies = [
  "Hi, I'm glad you reached out. What's on your mind?",
  "That sounds really tough. Thanks for telling me.",
  "You're not behind and you're not alone. Many students feel this.",
  "What's one small thing that might make today a bit easier?"
];
let replyNumber = 0;

let popup = document.getElementById("popup");
let msgs = document.getElementById("msgs");
let chatInput = document.getElementById("chatInput");

function addMessage(text, who) {
  let div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;   // scroll to the newest message
}

document.getElementById("chatBtn").addEventListener("click", function () {
  popup.hidden = false;

  // first greeting only once
  if (msgs.children.length == 0) {
    setTimeout(function () {
      addMessage(replies[0], "them");
      replyNumber = 1;
    }, 500);
  }
});

document.getElementById("closeBtn").addEventListener("click", function () {
  popup.hidden = true;
});

document.getElementById("chatForm").addEventListener("submit", function (e) {
  e.preventDefault();   // stops the page from reloading

  let text = chatInput.value.trim();
  if (text == "") {
    return;
  }

  addMessage(text, "me");
  chatInput.value = "";

  // reply after a short delay so it feels real
  setTimeout(function () {
    addMessage(replies[replyNumber % replies.length], "them");
    replyNumber = replyNumber + 1;
  }, 900);
});
