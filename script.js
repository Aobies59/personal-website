const windowTitles = Array.from(document.getElementsByClassName("title"));
const footerButtons = Array.from(
  document.getElementsByClassName("footer_button"),
);
const closeButtons = Array.from(document.getElementsByClassName("title_close"));

// desktop selector
const desktop = document.getElementById("desktop");
const desktopSelector = document.createElement("div");
desktopSelector.id = "selector";
desktop.appendChild(desktopSelector);
let initialSelectorPosition = { x: 0, y: 0 };
desktop.addEventListener("pointerdown", (event) => {
  initialSelectorPosition.x = event.clientX;
  initialSelectorPosition.y = event.clientY;
  desktopSelector.style.left = event.clientX + "px";
  desktopSelector.style.top = event.clientY + "px";
  desktopSelector.style.width = 0;
  desktopSelector.style.height = 0;
  desktopSelector.style.display = "flex";
});
desktop.addEventListener("pointerleave", () => {
  desktopSelector.style.display = "none";
});

// start bar buttons
const footer = document.querySelector("footer");
closeButtons.forEach((currButton) => {
  currButton.addEventListener("click", () => {
    const window = currButton.parentNode.parentNode;
    const footerButtons = Array.from(footer.querySelectorAll("div"));
    for (let i = 0; i < footerButtons.length; i++) {
      const currButton = footerButtons[i];
      if (currButton.dataset.window == window.id) {
        currButton.remove();
        break;
      }
    }
    window.remove();
  });
});

// windows drag and drop
// create start menu buttons for each window
let selectedWindow = null;
let previouslySelectedWindow = null;
windowTitles.forEach((currTitle) => {
  const currWindow = currTitle.parentNode;
  const footerButton = document.createElement("div");
  footerButton.classList.add("footer_button", "bordered");
  footerButton.dataset.window = currWindow.id;
  footerButton.innerHTML = currWindow.id;
  footer.insertBefore(footerButton, document.getElementById("filler"));

  currTitle.addEventListener("pointerdown", () => {
    selectedWindow = currWindow;
    selectedWindow.style.zIndex = 3;
  });
});

// click start menu buttons
let clickedButton = null;
const clickedButtonClassName = "clicked";
footerButtons.forEach((currButton) => {
  currButton.addEventListener("pointerdown", (event) => {
    currButton.classList.remove(clickedButtonClassName);
    if (currButton != clickedButton) {
      clickedButton = currButton;
      clickedButton.classList.add(clickedButtonClassName);
    } else {
      clickedButton = null;
    }

    event.stopPropagation();
  });
});

// deselect window when lifting pointer
document.addEventListener("pointerup", () => {
  if (selectedWindow != null) {
    selectedWindow.style.zIndex = 2;
    if (previouslySelectedWindow != null) {
      previouslySelectedWindow.style.zIndex = 1;
    }
    previouslySelectedWindow = selectedWindow;
  }
  selectedWindow = null;
  desktopSelector.style.display = "none";
});

// deselect clicked start menu button when clicking anywhere else
document.addEventListener("pointerdown", () => {
  if (clickedButton != null) {
    clickedButton.classList.remove(clickedButtonClassName);
    clickedButton = null;
  }
});

// drag and drop windows
// desktop selector
let previousPointerPosition = null;
document.addEventListener("pointermove", (event) => {
  if (previousPointerPosition == null) {
    previousPointerPosition = { x: event.clientX, y: event.clientY };
    return;
  }

  const dX = event.clientX - previousPointerPosition["x"];
  const dY = event.clientY - previousPointerPosition["y"];

  if (selectedWindow != null) {
    const windowRect = selectedWindow.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    const windowTop = Math.min(
      Math.max(windowRect.top + dY, 0),
      bodyRect.height - 60,
    );
    const windowLeft = Math.max(windowRect.left + dX, 0);

    selectedWindow.style.left = windowLeft + "px";
    selectedWindow.style.top = windowTop + "px";
  } else {
    const xDiff = initialSelectorPosition.x - event.clientX;
    if (xDiff > 0) {
      desktopSelector.style.left = event.clientX + "px";
      desktopSelector.style.width = xDiff + "px";
    } else {
      desktopSelector.style.left = initialSelectorPosition.x;
      desktopSelector.style.width = -xDiff + "px";
    }

    const yDiff = initialSelectorPosition.y - event.clientY;
    if (yDiff > 0) {
      desktopSelector.style.top = event.clientY + "px";
      desktopSelector.style.height = yDiff + "px";
    } else {
      desktopSelector.style.top = initialSelectorPosition.y;
      desktopSelector.style.height = -yDiff + "px";
    }
  }

  previousPointerPosition = { x: event.clientX, y: event.clientY };
});

let timerSeconds = 0;
let timerMinutes = 0;
const maxTimerValue = 60;
const secondsContainer = document.getElementById("timer-seconds");
const minutesContainer = document.getElementById("timer-minutes");
setInterval(() => {
  timerSeconds += 1;
  if (timerSeconds >= maxTimerValue) {
    timerMinutes = Math.min(timerMinutes + 1, maxTimerValue);
    timerSeconds = 0;
  }

  let secondsString = String(timerSeconds);
  if (timerSeconds < 10) {
    secondsString = "0" + secondsString;
  }

  let minutesString = String(timerMinutes);
  if (timerMinutes < 10) {
    minutesString = "0" + minutesString;
  }

  secondsContainer.innerHTML = secondsString;
  minutesContainer.innerHTML = minutesString;
}, 1000);

// clock
const clockHoursContainer = document.getElementById("clock_hours");
const clockMinutesContainer = document.getElementById("clock_minutes");
const clockAmPmContainer = document.getElementById("clock_ampm");
function updateClock() {
  let currDate = new Date();
  let minutesString = String(currDate.getMinutes());
  if (minutesString.length < 2) {
    minutesString = "0" + minutesString;
  }

  const hours = currDate.getHours();
  let amPmString;
  if (hours > 12) {
    amPmString = "PM";
    hours -= 12;
  } else {
    amPmString = "AM";
  }

  let hoursString = String(hours);
  if (hoursString.length < 2) {
    hoursString = "0" + hoursString;
  }

  clockHoursContainer.innerHTML = hoursString;
  clockMinutesContainer.innerHTML = minutesString;
  clockAmPmContainer.innerHTML = amPmString;
}
setInterval(updateClock, 60000);
updateClock();
