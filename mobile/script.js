const appsContainerElem = document.getElementById("appsContainer");
const footerElem = document.querySelector("footer");
const navigationPillElem = document.getElementById("navigationPill");

// window.alert("This is a work in progress, and is not in a functional state yet");

let appOpen;

const appTemplates = Array.from(document.querySelector("template").content.children)
  .reduce((acc, item) => {
    acc[item.dataset.name] = item;
    return acc;
  }, {});

function openApp(appName) {
  if (appTemplates[appName] == null) {
    console.error("App " + appName + " does not exist");
    return;
  }

  document.body.removeChild(appsContainerElem)
  document.body.removeChild(footerElem);

  const appElem = appTemplates[appName];
  document.body.appendChild(appElem);
  appElem.dispatchEvent(new Event("open"));

  appOpen = appElem;

  if (hasBrightBackground(appElem)) {
    navigationPillElem.style.backgroundColor = "black";
  } else {
    navigationPillElem.style.backgroundColor = "white";
  }
}

Array.from(appsContainerElem.children)
  .forEach(app => {
    app.addEventListener("click", () => {
      openApp(app.dataset.name);
    })
  });

navigationPillElem.addEventListener("click", () => {
  if (appOpen == null) {
    return;
  }
  appOpen.dispatchEvent(new Event("close"));
  document.body.removeChild(appOpen);
  appOpen = null;
  document.body.appendChild(appsContainerElem);
  document.body.appendChild(footerElem);
  navigationPillElem.style.backgroundColor = "white";
})

// made with ChatGpt
function hasBrightBackground(elem) {
  const color = window.getComputedStyle(elem).backgroundColor;
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 128;
}

// STRETCHES

let wakeLock = null;
async function requestWaylock() {
  wakeLock = await navigator.wakeLock.request("screen")
  document.addEventListener("visibilitychange", async () => {
    if (wakeLock !== null && document.visibilityState === "visible") {
      wakeLock = await navigator.wakeLock.request("screen");
    }
  });
}

let stretchTimerIndex;
let currTimerMinutes;
let stretchDuration;
let timerRunning = false;
let currTimerTextElem;
let stretchInterval;
let stretchTimers;
const stretchesElem = document.querySelector("template").content.getElementById("stretches");
const stretchNotificationAudio = new Audio("assets/ding.mp3");
const TimerState = {
  PAUSED: 0,
  RUNNING: 1,
  INACTIVE: 2
}
const playImg = "assets/play.png";
const playActiveImg = "assets/play_active.png";
const pauseImg = "assets/pause_active.png";

stretchesElem.addEventListener("open", () => {
  stretchTimers = Array.from(document.getElementsByClassName("timer"));
  stretchTimerIndex = 0
  currTimerMinutes = 1;
  currTimerSeconds = 0;
  timerRunning = false;
  const currTimer = stretchTimers[stretchTimerIndex];
  const currTimerButton = currTimer.querySelector("button");
  currTimerButton.addEventListener("click", toggleTimer);
  currTimerTextElem = currTimer.querySelector(".timer_time");
  stretchInterval = setInterval(countDown, 1000);
})

function toggleTimer() {
  const currTimer = stretchTimers[stretchTimerIndex];
  if (timerRunning) {
    changeTimerState(currTimer, TimerState.PAUSED);
  } else {
    changeTimerState(currTimer, TimerState.RUNNING);
    requestWaylock();
  }
  timerRunning = !timerRunning;
}

function switchTimer() {
  stretchNotificationAudio.play();
  timerRunning = false;
  currTimerMinutes = 1;
  currTimerSeconds = 0;
  const previousTimer = stretchTimers[stretchTimerIndex];
  const previousTimerButton = previousTimer.querySelector("button");
  previousTimerButton.removeEventListener("click", toggleTimer);
  changeTimerState(previousTimer, TimerState.INACTIVE);

  stretchTimerIndex += 1;
  const currTimer = stretchTimers[stretchTimerIndex];
  if (currTimer == null) {
    wakeLock.release();
    wakeLock = null;
    clearInterval(stretchInterval);
    return;
  }
  currTimerTextElem = currTimer.querySelector(".timer_time");
  changeTimerState(currTimer, TimerState.RUNNING);
  currTimerTextElem.innerText = "1:00";;
  const currTimerButton = currTimer.querySelector("button");
  currTimerButton.addEventListener("click", toggleTimer);
  timerRunning = true;
}

function countDown() {
  if (!timerRunning) return;
  if (currTimerTextElem == null) return;
  currTimerSeconds -= 1;
  if (currTimerSeconds < 0) {
    currTimerMinutes -= 1;
    currTimerSeconds = 59;
  }
  if (currTimerMinutes < 0) {
    currTimerTextElem.innerText = "0:00";
    switchTimer();
    return;
  }
  let secondsText = currTimerSeconds;
  if (currTimerSeconds < 10) {
    secondsText = "0" + secondsText;
  }
  currTimerTextElem.innerText = "" + currTimerMinutes + ":" + secondsText;
}

function changeTimerState(timerElem, newState) {
  const timerButton = timerElem.querySelector("button");
  const buttonImage = timerButton.querySelector("img");

  if (newState == TimerState.PAUSED) {
    timerButton.classList.add("active");
    timerButton.classList.add("paused");
    buttonImage.src = playActiveImg;
  } else if (newState == TimerState.RUNNING) {
    timerButton.classList.add("active");
    timerButton.classList.remove("paused");
    buttonImage.src = pauseImg;
  } else if (newState == TimerState.INACTIVE) {
    timerButton.classList.remove("active")
    timerButton.classList.remove("paused");
    timerButton.classList.add("inactive");
    buttonImage.src = playImg;
  }
}

stretchesElem.addEventListener("close", () => {
  clearInterval(stretchInterval);
  stretchTimers.forEach(currTimer => {
    currTimer.querySelector(".timer_time").innerText = "1:00";
    const currTimerButton = currTimer.querySelector("button");
    currTimerButton.classList.remove("inactive");
    currTimerButton.classList.remove("paused");
    currTimerButton.classList.remove("active");
    currTimer.querySelector("img").src = playImg;
  })
})

