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
// TODO: play and pause icons 

let stretchTimerIndex;
let currTimerMinutes;
let stretchDuration;
let timerRunning = false;
let currTimerTextElem;
let stretchInterval;
let stretchTimers;
const stretchesElem = document.querySelector("template").content.getElementById("stretches");
const stretchNotificationAudio = new Audio("assets/ding.mp3");

stretchesElem.addEventListener("open", () => {
  stretchTimers = Array.from(document.getElementsByClassName("timer"));
  stretchTimerIndex = 0
  currTimerMinutes = 1;
  currTimerSeconds = 0;
  timerRunning = false;
  const currTimer = stretchTimers[stretchTimerIndex];
  currTimer.classList.add("clickable");
  const currTimerButton = currTimer.querySelector("button");
  currTimerButton.addEventListener("click", toggleTimer);
  currTimerTextElem = currTimer.querySelector(".timer_time");
  stretchInterval = setInterval(countDown, 1000);
})

function toggleTimer() {
  stretchTimers[stretchTimerIndex].classList.toggle("active");
  timerRunning = !timerRunning;
}

function switchTimer() {
  stretchNotificationAudio.play();
  timerRunning = false;
  currTimerMinutes = 1;
  currTimerSeconds = 0;
  const previousTimer = stretchTimers[stretchTimerIndex];
  previousTimer.classList.remove("clickable");
  previousTimer.classList.remove("active");
  previousTimer.classList.add("inactive");

  stretchTimerIndex += 1;
  const currTimer = stretchTimers[stretchTimerIndex];
  if (currTimer == null) {
    clearInterval(stretchInterval);
    return;
  }
  currTimerTextElem = currTimer.querySelector(".timer_time");
  currTimer.classList.add("clickable");
  currTimer.classList.add("active");
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

stretchesElem.addEventListener("close", () => {
  clearInterval(stretchInterval);
  stretchTimers.forEach(currTimer => {
    currTimer.querySelector(".timer_time").innerText = "1:00";
  })
})

// temp 
openApp("Stretches");

