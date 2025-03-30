const footer = document.querySelector("footer");
let footerButtons = Array.from(footer.querySelectorAll("div"));
const desktop = document.getElementById("desktop");

let clickedButton = null;
const activeButtonClassName = "active";
function selectStartBarButton(button) {
  const window = document.getElementById(button.dataset.window);
  if (window != null) {
    if (window.classList.contains(highlightedWindowClassName)) {
      deHighlightWindow();
    } else {
      highlightWindow(window);
    }
  }
}

let configuredButtons = [];
function updateFooterButtonsList() {
  footerButtons = Array.from(footer.querySelectorAll("div.footer_button"));
  footerButtons.forEach((currButton) => {
    if (!configuredButtons.includes(currButton)) {
      currButton.addEventListener("pointerdown", () => {
        selectStartBarButton(currButton);
      });
      configuredButtons.push(currButton);
    }
  });
}
updateFooterButtonsList();

const desktopSelector = document.createElement("div");
desktopSelector.id = "selector";
desktop.appendChild(desktopSelector);
let initialSelectorPosition = { x: 0, y: 0 };
let usingSelector = false;
desktop.addEventListener("pointerdown", (event) => {
  initialSelectorPosition.x = event.clientX;
  initialSelectorPosition.y = event.clientY;
  desktopSelector.style.left = event.clientX + "px";
  desktopSelector.style.top = event.clientY + "py";
  desktopSelector.style.width = 0;
  desktopSelector.style.height = 0;
  desktopSelector.style.display = "flex";
  usingSelector = true;

  deHighlightWindow();
});

function closeWindow(window) {
  for (let i = 0; i < footerButtons.length; i++) {
    const currButton = footerButtons[i];
    if (currButton.dataset.window == window.id) {
      currButton.remove();
      updateFooterButtonsList();
      break;
    }
  }
  window.remove();
}

let highlightedWindow = null;
let previouslyHighlightedWindow = null;
let highlightedWindowFooterButton = null;
const highlightedWindowClassName = "window-active";
function highlightWindow(window) {
  window.classList.add(highlightedWindowClassName);
  window.style.zIndex = 5;
  if (highlightedWindowFooterButton != null) {
    highlightedWindowFooterButton.classList.remove("active");
  }
  for (let i = 0; i < footerButtons.length; i++) {
    const currFooterButton = footerButtons[i];
    if (currFooterButton.dataset.window == window.id) {
      currFooterButton.classList.add("active");
      highlightedWindowFooterButton = currFooterButton;
    }
  }
  if (window == highlightedWindow) {
    return;
  }
  if (highlightedWindow != null) {
    if (previouslyHighlightedWindow != null) {
      previouslyHighlightedWindow.style.zIndex = 2;
    }
    highlightedWindow.classList.remove(highlightedWindowClassName);
    highlightedWindow.style.zIndex = 3;
    previouslyHighlightedWindow = highlightedWindow;
  }
  highlightedWindow = window;
}
function deHighlightWindow() {
  if (highlightedWindow != null) {
    highlightedWindow.classList.remove("window-active");
    if (highlightedWindowFooterButton != null) {
      highlightedWindowFooterButton.classList.remove("active");
    }
  }
}

let previouslySelectedWindow = null;
const startBarFiller = document.getElementById("filler");
function createStartBarButton(windowId) {
  const footerButton = document.createElement("div");
  footerButton.classList.add("footer_button", "bordered");
  footerButton.dataset.window = windowId;
  footerButton.innerHTML = windowId;
  footer.insertBefore(footerButton, startBarFiller);
  updateFooterButtonsList();
}

let selectedWindow = null;
function selectWindow(window) {
  selectedWindow = window;
  highlightWindow(window);
}

function createWindow(windowId, left, top, title, content, windowType=null, scrollable=false) {
  const windowDiv = document.createElement("div");
  windowDiv.classList.add("window", "bordered");
  if (windowType != null) {
    windowDiv.classList.add(windowType)
  }
  windowDiv.id = windowId;
  windowDiv.style.left = left;
  windowDiv.style.top = top;

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("title");
  titleDiv.innerHTML = title;
  titleDiv.addEventListener("pointerdown", () => {
    selectWindow(windowDiv);
  })
  const closeButtonDiv = document.createElement("div");
  closeButtonDiv.classList.add("title_close", "bordered");
  closeButtonDiv.innerHTML = "x";
  closeButtonDiv.addEventListener("click", () => {
    closeWindow(windowDiv);
  })
  titleDiv.appendChild(closeButtonDiv);
  windowDiv.appendChild(titleDiv);

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("content");
  if (scrollable) {
    contentDiv.classList.add("scrollable");
  }
  contentDiv.innerHTML = content;
  windowDiv.appendChild(contentDiv);

  windowDiv.addEventListener("pointerdown", () => {
    highlightWindow(windowDiv);
  })

  document.body.appendChild(windowDiv);
  createStartBarButton(windowId);
}

// deselect window when lifting pointer
document.addEventListener("pointerup", () => {
  selectedWindow = null;
  desktopSelector.style.display = "none";
  usingSelector = false;
});

// move selected window
// drag desktop selector
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

// update clock
const clockHoursContainer = document.getElementById("clock_hours");
const clockMinutesContainer = document.getElementById("clock_minutes");
const clockAmPmContainer = document.getElementById("clock_ampm");
function updateClock() {
  let currDate = new Date();
  let minutesString = String(currDate.getMinutes());
  if (minutesString.length < 2) {
    minutesString = "0" + minutesString;
  }

  let hours = currDate.getHours();
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
setInterval(updateClock, 10000);
updateClock();

// desktop icons functionality
function rectsIntersect(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  )
}
let activeIcons = [];
const desktopIcons = Array.from(document.getElementsByClassName("desktop_icon"));
const activeIconClassName = "active";
function addActiveIcon(icon) {
  icon.classList.add(activeIconClassName);
  if (!activeIcons.includes(icon)) {
    activeIcons.push(icon);
  }
}
document.addEventListener("pointermove", () => {
  if (!usingSelector) {
    return;
  }
  const selectorRect = selector.getBoundingClientRect();
  desktopIcons.forEach((currIcon) => {
    const iconRect = currIcon.getBoundingClientRect();
    if (rectsIntersect(selectorRect, iconRect)) {
      addActiveIcon(currIcon);
    } else {
      activeIcons = activeIcons.filter(icon => icon != currIcon);
      currIcon.classList.remove(activeIconClassName);
    }
  })
})
function deselectIcons() {
  activeIcons.forEach((currIcon) => {
    currIcon.classList.remove(activeIconClassName);
  })
  activeIcons = [];
}
desktopIcons.forEach((currIcon) => {
  currIcon.addEventListener("click", () => {
    if (activeIcons.includes(currIcon)) {
      return; // TODO: open the icons page
    } else {
      deselectIcons();
      addActiveIcon(currIcon);
    }
  })
})
desktop.addEventListener("pointerdown", deselectIcons);

// start button functionality
const startButton = document.getElementById("start");
startButton.addEventListener("click", deHighlightWindow);
const startMenu = document.getElementById("startMenu");
startButton.addEventListener("pointerdown", (event) => {
  startMenu.classList.toggle("active");
  startButton.classList.toggle(activeButtonClassName);
  event.stopPropagation();
});
startMenu.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});
document.addEventListener("pointerdown", () => {
  startMenu.classList.remove("active");
  startButton.classList.remove(activeButtonClassName);
});

createWindow("welcome", "10%", "10%", "Welcome!",
  "Welcome to my personal website!<br>\
  Here you will find the random stuff I make when I'm bored.<br>\
  Hope you like it!",
  "window-text");

createWindow("todo", "40%", "30%", "To Do:", 
  "&check; Make the clock in the bottom right actually work<br />\
  &check; Create scrollable windows (with custom scrollbar)<br />\
  &check; Make it so you can focus windows using the start bar<br />\
  &check; Add some functionality to the start button<br />\
  - Add some functionality to the start menu<br />\
  - Add minimizing/maximing windows<br />\
  - Add icons to the desktop (with the ability to select, click and open them)<br />\
  - Add a portfolio page<br />\
  - Add a resume page<br />\
  - Minesweeper<br />",
  "window-big", true);

createWindow("timer", "20%", "50%", "Timer",
  "<span id='timer-minutes'>00</span>:<span id='timer-seconds'>00</span>", "window-small")
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

console.log("If you are reading this follow me :)");
