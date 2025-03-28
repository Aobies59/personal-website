const windowTitles = Array.from(document.getElementsByClassName("title"));
const footer = document.querySelector("footer");
let footerButtons = Array.from(footer.querySelectorAll("div"));
const closeButtons = Array.from(document.getElementsByClassName("title_close"));
const desktop = document.getElementById("desktop");

// click start menu buttons
let clickedButton = null;
const activeButtonClassName = "active";
function selectStartMenuButton(button) {
  const window = document.getElementById(button.dataset.window);
  if (window != null) {
    highlightWindow(window);
  }
  if (clickedButton != null)
    clickedButton.classList.remove(activeButtonClassName);
  if (button == clickedButton) {
    clickedButton = null;
  } else {
    button.classList.add(activeButtonClassName);
    clickedButton = button;
  }
}
function addClickingFunctionality(button) {
  button.addEventListener("pointerdown", (event) => {
    selectStartMenuButton(button);
    event.stopPropagation();
  });
}
function updateFooterButtonsList() {
  footerButtons = Array.from(footer.querySelectorAll("div.footer_button"));
}
updateFooterButtonsList();
footerButtons.forEach((currButton) => addClickingFunctionality(currButton));

// desktop selector
const desktopSelector = document.createElement("div");
desktopSelector.id = "selector";
desktop.appendChild(desktopSelector);
let initialSelectorPosition = { x: 0, y: 0 };
desktop.addEventListener("pointerdown", (event) => {
  initialSelectorPosition.x = event.clientX;
  initialSelectorPosition.y = event.clientY;
  desktopSelector.style.left = event.clientX + "px";
  desktopSelector.style.top = event.clientY + "py";
  desktopSelector.style.width = 0;
  desktopSelector.style.height = 0;
  desktopSelector.style.display = "flex";
});
desktop.addEventListener("pointerleave", () => {
  desktopSelector.style.display = "none";
});

// window close buttons
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
closeButtons.forEach((currButton) => {
  currButton.addEventListener("click", () => {
    closeWindow(currButton.parentNode.parentNode);
  });
});

// highlight windows
let highlightedWindow = null;
let previouslyHighlightedWindow = null;
let highlightedWindowFooterButton = null;
function highlightWindow(window) {
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
      previouslyHighlightedWindow.style.zIndex = 1;
    }
    highlightedWindow
      .getElementsByClassName("title")[0]
      .classList.remove("title-active");
    highlightedWindow.style.zIndex = 2;
    previouslyHighlightedWindow = highlightedWindow;
  }
  window.getElementsByClassName("title")[0].classList.add("title-active");
  window.style.zIndex = 3;
  highlightedWindow = window;
}

// select windows when clicking on title bar
// create start menu buttons for each window
let selectedWindow = null;
let previouslySelectedWindow = null;
const startMenuFiller = document.getElementById("filler");
function createStartMenuButton(windowId) {
  const footerButton = document.createElement("div");
  footerButton.classList.add("footer_button", "bordered");
  footerButton.dataset.window = windowId;
  footerButton.innerHTML = windowId;
  addClickingFunctionality(footerButton);
  footer.insertBefore(footerButton, startMenuFiller);
}
function selectWindow(window) {
  selectedWindow = window;
  highlightWindow(window);
}
windowTitles.forEach((currTitle) => {
  const currWindow = currTitle.parentNode;
  createStartMenuButton(currWindow.id);
  updateFooterButtonsList();

  currTitle.addEventListener("pointerdown", () => {
    selectWindow(currWindow);
  });

  currWindow.addEventListener("pointerdown", () => {
    highlightWindow(currWindow);
  });
});

// deselect window when lifting pointer
document.addEventListener("pointerup", () => {
  selectedWindow = null;
  desktopSelector.style.display = "none";
});

// deselect clicked start menu button when clicking anywhere else
function deselectStartMenuButton() {
  if (clickedButton != null) {
    clickedButton.classList.remove(activeButtonClassName);
    clickedButton = null;
  }
}
document.addEventListener("pointerdown", () => {
  deselectStartMenuButton();
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

// update timer
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
