const footer = document.querySelector("footer");
let footerButtons = Array.from(footer.querySelectorAll("div"));
const desktop = document.getElementById("desktop");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// select window with start bar button
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
  let ignore = false;
  desktopIcons.forEach((currIcon) => {
    if (currIcon == event.target || currIcon.contains(event.target)) {
      ignore = true;
      return;
    }
  });
  if (ignore) return;
  initialSelectorPosition.x = event.clientX;
  initialSelectorPosition.y = event.clientY;
  desktopSelector.style.left = event.clientX + "px";
  desktopSelector.style.top = event.clientY + "py";
  desktopSelector.style.width = 0;
  desktopSelector.style.height = 0;
  desktopSelector.style.display = "flex";
  usingSelector = true;
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
  if (window.dataset.desktopicon) {
    desktopWindows[window.id] = false;
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
    if (previouslyHighlightedWindow != null && previouslyHighlightedWindow != window) {
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
document.addEventListener("pointerdown", (event) => {
  const ignoredNodes = [highlightedWindow, ...footerButtons];
  let ignore = false;
  ignoredNodes.forEach((currNode) => {
    if (currNode == null) return;
    if (currNode == event.target || currNode.contains(event.target)) {
      ignore = true;
      return;
    }
  });
  if (ignore) return;
  deHighlightWindow();
});

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

function createWindow(
  windowId,
  left,
  top,
  title,
  content,
  windowType = null,
  scrollable = false,
) {
  const windowDiv = document.createElement("div");
  windowDiv.classList.add("window", "bordered");
  if (windowType != null) {
    windowDiv.classList.add(windowType);
  }
  windowDiv.id = windowId;
  windowDiv.style.left = left;
  windowDiv.style.top = top;

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("title");
  titleDiv.innerHTML = title;
  titleDiv.addEventListener("pointerdown", () => {
    selectWindow(windowDiv);
  });
  const closeButtonDiv = document.createElement("div");
  closeButtonDiv.classList.add("title_close", "bordered");
  closeButtonDiv.innerHTML = "x";
  closeButtonDiv.addEventListener("click", () => {
    closeWindow(windowDiv);
  });
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
  });

  document.body.appendChild(windowDiv);
  createStartBarButton(windowId);
  highlightWindow(windowDiv);

  return windowDiv;
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

// start button functionality
const startButton = document.getElementById("start");
const startMenu = document.getElementById("startMenu");
startButton.addEventListener("pointerdown", (event) => {
  startMenu.classList.toggle("active");
  startButton.classList.toggle(activeButtonClassName);
});
document.addEventListener("pointerdown", (event) => {
  const ignoredNodes = [startMenu, startButton];
  let ignore = false;
  ignoredNodes.forEach((currNode) => {
    if (event.target == currNode || currNode.contains(event.target)) {
      ignore = true;
      return;
    }
  });
  if (ignore) return;
  startMenu.classList.remove("active");
  startButton.classList.remove(activeButtonClassName);
});
const githubButton = document.getElementById("github");
githubButton.addEventListener("click", () => {
  window.open("https://github.com/Aobies59", "_blank");
})
const linkedinButton = document.getElementById("linkedin");
linkedinButton.addEventListener("click", () => {
  window.open("https://www.linkedin.com/in/%C3%A1lvaro-obies-garc%C3%ADa-b26589235/", "_blank");
})

createWindow(
  "welcome",
  "10%",
  "10%",
  "Welcome!",
  "Welcome to my personal website!<br>\
  Here you will find the random stuff I make when I'm bored.<br>\
  Hope you like it!",
  "window-text",
);

// desktop icons functionality
const templateElements = Array.from(
  document.querySelector("template").content.children,
);
function getTemplateElement(elementId) {
  for (let i = 0; i < templateElements.length; i++) {
    const currTemplateElement = templateElements[i];
    if (currTemplateElement.id == elementId) {
      return currTemplateElement;
    }
  }
  return null;
}
function rectsIntersect(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
let activeIcons = [];
const desktopIcons = Array.from(
  document.getElementsByClassName("desktop_icon"),
);
let desktopWindows = {};
desktopIcons.forEach((currIcon) => {
  desktopWindows[currIcon.dataset.window] = false;
});
const activeIconClassName = "active";
function selectIcon(icon) {
  icon.classList.add(activeIconClassName);
  if (!activeIcons.includes(icon)) {
    activeIcons.push(icon);
  }
}
function deselectIcon(icon) {
  icon.classList.remove(activeIconClassName);
  activeIcons = activeIcons.filter((currIcon) => icon != currIcon);
}
document.addEventListener("pointermove", () => {
  if (!usingSelector) {
    return;
  }
  const selectorRect = selector.getBoundingClientRect();
  desktopIcons.forEach((currIcon) => {
    const iconRect = currIcon.getBoundingClientRect();
    if (rectsIntersect(selectorRect, iconRect)) {
      selectIcon(currIcon);
    } else {
      deselectIcon(currIcon);
    }
  });
});
function deselectIcons() {
  activeIcons.forEach((currIcon) => {
    currIcon.classList.remove(activeIconClassName);
  });
  activeIcons = [];
}
desktopIcons.forEach((currIcon) => {
  currIcon.addEventListener("click", () => {
    if (activeIcons.includes(currIcon)) {
      if (!desktopWindows[currIcon.dataset.window]) {
        const templateWindow = getTemplateElement(currIcon.dataset.window);
        const newWindow = createWindow(
          currIcon.dataset.window,
          templateWindow.dataset.left,
          templateWindow.dataset.top,
          templateWindow.dataset.title,
          templateWindow.innerHTML,
          "window-" + templateWindow.dataset.windowsize,
          templateWindow.dataset.scrollable == "True",
        );
        newWindow.dataset.desktopicon = newWindow.id;
        desktopWindows[currIcon.dataset.window] = true;
        deselectIcons();
      }
    } else {
      deselectIcons();
      selectIcon(currIcon);
    }
  });
});
document.addEventListener("pointerdown", (event) => {
  ignore = false;
  desktopIcons.forEach((currIcon) => {
    if (event.target == currIcon || currIcon.contains(event.target)) {
      ignore = true;
      return;
    }
  });
  if (ignore) return;
  deselectIcons();
});

let timerSeconds = 0;
let timerMinutes = 0;
const maxTimerValue = 60;
let secondsContainer = document.getElementById("timer-seconds");
let minutesContainer = document.getElementById("timer-minutes");
setInterval(() => {
  secondsContainer = document.getElementById("timer-seconds");
  minutesContainer = document.getElementById("timer-minutes");
  if (secondsContainer == null || minutesContainer == null) {
    timerSeconds = 0;
    timerMinutes = 0;
    return;
  }
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
