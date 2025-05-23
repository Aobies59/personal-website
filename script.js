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
      if (previouslyHighlightedWindow != null && previouslyHighlightedWindow.style.display != "none")
        highlightWindow(previouslyHighlightedWindow);
      window.style.display = "none";
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

const windowCloseFunctions = {
  stretches: stopStretchTimer,
  minesweeper: resetMinesweeper
}
function closeWindow(windowToClose) {
  for (let i = 0; i < footerButtons.length; i++) {
    const currButton = footerButtons[i];
    if (currButton.dataset.window == windowToClose.id) {
      currButton.remove();
      updateFooterButtonsList();
      break;
    }
  }
  if (windowToClose.dataset.desktopicon) {
    desktopWindows[windowToClose.id] = false;
  }
  const windowCloseFunction = windowCloseFunctions[windowToClose.id];
  if (windowCloseFunction != null) windowCloseFunction();
  windowToClose.remove();
}

let highlightedWindow = null;
let previouslyHighlightedWindow = null;
let highlightedWindowFooterButton = null;
const highlightedWindowClassName = "window-active";
function highlightWindow(window) {
  window.style.display = "initial";
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
    if (
      previouslyHighlightedWindow != null &&
      previouslyHighlightedWindow != window
    ) {
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

const windowFunctions = {
  timer: startTimer,
  minesweeper: generateMinesweeper,
  paint: generatePaint,
  stretches: generateStretches
};
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

  if (windowFunctions[windowId] != null) {
    windowFunctions[windowId]();
  }

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

// start menu functionality
const startButton = document.getElementById("start");
const startMenu = document.getElementById("startMenu");
const startMenuButtons = Array.from(
  document.getElementById("startMenu_content").children,
);
startButton.addEventListener("pointerdown", (event) => {
  startMenu.classList.toggle("active");
  startButton.classList.toggle(activeButtonClassName);
});
function closeStartMenu() {
  startMenu.classList.remove("active");
  startButton.classList.remove(activeButtonClassName);
}
document.addEventListener("pointerup", (event) => {
  if (!startMenu.classList.contains("active")) return;
  const ignoredNodes = [startButton, ...startMenuButtons];
  let ignore = false;
  ignoredNodes.forEach((currButton) => {
    if (currButton == event.target || currButton.contains(event.target)) {
      ignore = true;
      return;
    }
  });
  if (ignore) return;
  closeStartMenu();
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
  closeStartMenu();
});
startMenuButtons.forEach((currButton) => {
  currButton.addEventListener("click", closeStartMenu);
  currButton.addEventListener("pointerup", closeStartMenu);
});
const githubButton = document.getElementById("github");
githubButton.addEventListener("click", () => {
  window.open("https://github.com/Aobies59", "_blank");
});
githubButton.addEventListener("pointerup", () => {
  window.open("https://github.com/Aobies59", "_blank");
});
const linkedinButton = document.getElementById("linkedin");
linkedinButton.addEventListener("click", () => {
  window.open(
    "https://www.linkedin.com/in/%C3%A1lvaro-obies-garc%C3%ADa-b26589235/",
    "_blank",
  );
});
linkedinButton.addEventListener("pointerup", () => {
  window.open(
    "https://www.linkedin.com/in/%C3%A1lvaro-obies-garc%C3%ADa-b26589235/",
    "_blank",
  );
});

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

function startTimer() {
  let timerSeconds = 0;
  let timerMinutes = 0;
  const maxTimerValue = 60;

  let timerContainer = document.getElementById("timer");
  const secondsContainer = document.getElementById("timer-seconds");
  const minutesContainer = document.getElementById("timer-minutes");

  const timerInterval = setInterval(() => {
    timerContainer = document.getElementById("timer");
    if (timerContainer == null) {
      clearInterval(timerInterval);
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

    if (timerMinutes == maxTimerValue) {
      secondsContainer.innerHTML = "00";
      minutesContainer.innerHTML == "60";
      timerContainer.classList.toggle("red");
    }

    secondsContainer.innerHTML = secondsString;
    minutesContainer.innerHTML = minutesString;
  }, 1000);
}

// minesweeper
const minesweeperSize = 9;
const mineNum = 10;
let squaresClicked = 0;
let minesGrid = [];
let blockGrid = [];
let mineNumGrid = [];
let firstClick = true;
let clearedBlocks = new Set();
let face = null;

let minesweeperTimerImages = [];
let timerContent = 0;
let minesweeperCountImages = [];
let mineCountContent = mineNum;
let minesweeperTimerInterval = null;
const minesweeperImageName = "assets/minesweeper-numbers/"

function stopMinesweeperTimer() {
  clearInterval(minesweeperTimerInterval);
}
let gameOver = false;
function loseGame() {
  face.classList.add("dead");
  stopMinesweeperTimer();
  gameOver = true;
  for (let i = 0; i < minesweeperSize; i++) {
    for (let j = 0; j < minesweeperSize; j++) {
      const block = blockGrid[i][j];
      if (isMine([i, j])) {
        block.classList.add("minesweeper_bomb");
        if (block.classList.contains("defused")) {
          block.classList.remove("defused");
          block.classList.add("bomb-defused");
        }
      }
    }
  }
}
function winGame() {
  face.classList.add("victory");
  stopMinesweeperTimer();
  gameOver = true;
  for (let i = 0; i < minesweeperSize; i++) {
    for (let j = 0; j < minesweeperSize; j++) {
      const block = blockGrid[i][j];
      if (isMine([i, j])) {
        block.classList.add("minesweeper_bomb");
        block.classList.add("bomb-defused");
      }
    }
  }
}
function generateMines(safePosition) {
  const mines = [JSON.stringify(safePosition)];
  for (let i = 0; i < mineNum; i++) {
    let currMine = [
      randInt(0, minesweeperSize - 1),
      randInt(0, minesweeperSize - 1),
    ];
    while (mines.includes(JSON.stringify(currMine))) {
      currMine = [
        randInt(0, minesweeperSize - 1),
        randInt(0, minesweeperSize - 1),
      ];
    }
    mines.push(JSON.stringify(currMine));
    minesGrid[currMine[0]][currMine[1]] = true;
  }
  generateMineNums();
}
function isMine(blockPosition) {
  return minesGrid[blockPosition[0]][blockPosition[1]];
}
function getMinesAroundNum(blockPosition) {
  let bombNum = 0;
  for (let i = blockPosition[0] - 1; i <= blockPosition[0] + 1; i++) {
    if (i < 0 || i >= minesweeperSize) continue;
    for (let j = blockPosition[1] - 1; j <= blockPosition[1] + 1; j++) {
      if (j < 0 || j >= minesweeperSize) continue;
      if ([i, j] == blockPosition) continue;
      if (minesGrid[i][j]) {
        bombNum += 1;
      }
    }
  }
  return bombNum;
}
function generateMineNums() {
  for (let i = 0; i < minesweeperSize; i++) {
    for (let j = 0; j < minesweeperSize; j++) {
      mineNumGrid[i][j] = getMinesAroundNum([i, j]);
    }
  }
}
function checkBlock(blockPosition) {
  let blocksToCheck = [blockPosition];
  for (let currBlockPosition of blocksToCheck) {
    if (currBlockPosition[0] < 0 || currBlockPosition[0] >= minesweeperSize)
      continue;
    if (currBlockPosition[1] < 0 || currBlockPosition[1] >= minesweeperSize)
      continue;
    if (clearedBlocks.has(JSON.stringify(currBlockPosition))) continue;
    const block = blockGrid[currBlockPosition[0]][currBlockPosition[1]];
    block.classList.remove("minesweeper_new");
    if (isMine(blockPosition)) {
      block.classList.add("minesweeper_bomb");
      block.classList.add("exploded");
      loseGame();
    } else {
      clearedBlocks.add(JSON.stringify(currBlockPosition));
      block.classList.add("minesweeper_empty");
      const mineNum = mineNumGrid[currBlockPosition[0]][currBlockPosition[1]];
      if (mineNum == 0) {
        blocksToCheck.push([currBlockPosition[0] - 1, currBlockPosition[1] - 1])
        blocksToCheck.push([currBlockPosition[0] - 1, currBlockPosition[1] + 1])
        blocksToCheck.push([currBlockPosition[0] + 1, currBlockPosition[1] - 1]);
        blocksToCheck.push([currBlockPosition[0] + 1, currBlockPosition[1] + 1])
        blocksToCheck.push([currBlockPosition[0] - 1, currBlockPosition[1]]);
        blocksToCheck.push([currBlockPosition[0] + 1, currBlockPosition[1]]);
        blocksToCheck.push([currBlockPosition[0], currBlockPosition[1] - 1]);
        blocksToCheck.push([currBlockPosition[0], currBlockPosition[1] + 1]);
      } else {
        block.innerHTML = mineNum;
      }
    }
  }
}
function clickBlock(blockPosition) {
  if (gameOver) return;
  if (clearedBlocks.has(blockPosition)) return;
  if (
    blockGrid[blockPosition[0]][blockPosition[1]].classList.contains("defused")
  )
    return;
  if (firstClick) {
    generateMines(blockPosition);
    firstClick = false;
  }
  checkBlock(blockPosition);
  if (clearedBlocks.size == minesweeperSize ** 2 - mineNum) {
    winGame();
  }
}
function defuseBlock(blockPosition, block) {
  if (clearedBlocks.has(JSON.stringify(blockPosition))) return;
  if (block.classList.contains("defused")) {
    mineCountContent += 1;
  } else {
    mineCountContent -= 1;
  }
  block.classList.toggle("defused");
  updateMinesweeperScore();
}
function highlightBlock(blockPosition, block) {
  if (gameOver) return;
  if (clearedBlocks.has(JSON.stringify(blockPosition))) return;
  if (block.classList.contains("defused")) return;
  block.classList.add("minesweeper_clicked");
  face.classList.add("clicked");
  block.addEventListener(
    "pointerup",
    () => {
      block.classList.remove("minesweeper_clicked");
      face.classList.remove("clicked");
    },
    { once: true },
  );
}
function resetMinesweeper() {
  minesweeperTimerImages.forEach((currImg) => {
    currImg.src = "assets/minesweeper-numbers/0.png";
  })
  mineCountContent = mineNum;
  updateMinesweeperScore();
  stopMinesweeperTimer();
  timerContent = 0;
}
function updateMinesweeperScore(){
  let scoreValues = [0, 0, 0];
  if (mineCountContent < 0) {
    scoreValues[0] = "-";
    if (mineCountContent > -10) {
      scoreValues[2] = -mineCountContent;
    } else {
      scoreValues[1] = Math.floor(mineCountContent / -10);
      scoreValues[2] = -mineCountContent - 10 * scoreValues[1];
    }
  } else {
    if (mineCountContent < 10) {
      scoreValues[2] = mineCountContent;
    } else if (mineCountContent < 100) {
      scoreValues[1] = Math.floor(mineCountContent / 10);
      scoreValues[2] = mineCountContent - 10 * scoreValues[1];
    } else {
      scoreValues[0] = Math.floor(mineCountContent / 100);
      scoreValues[1] = Math.floor((mineCountContent - 100 * scoreValues[1]) / 10);
      scoreValues[2] = mineCountContent - 100 * scoreValues[0] - 10 * scoreValues[1];
    }
  }
  for (let i = 0; i < 3; i++) {
    minesweeperCountImages[i].src = "assets/minesweeper-numbers/" + scoreValues[i] + ".png";
  }
}
function updateMinesweeperTimer(){
  timerContent = Math.min(999, timerContent + 1);
  let timerValues = [0, 0, 0];
  if (timerContent < 10) {
    timerValues[2] = timerContent;
  } else if (timerContent < 100) {
    timerValues[1] = Math.floor(timerContent / 10);
    timerValues[2] = Math.floor(timerContent % 10);
  } else {
    timerValues[0] = Math.floor(timerContent / 100);
    timerValues[1] = Math.floor((timerContent - 100 * timerValues[0]) / 10);
    timerValues[2] = Math.floor((timerContent - 100 * timerValues[0] - 10 * timerValues[1]));
  }
  for (let i = 0; i < 3; i++) {
    minesweeperTimerImages[i].src = "assets/minesweeper-numbers/" + timerValues[i] + ".png";
  }
}
function generateMinesweeper() {
  squaresClicked = 0;
  minesGrid = [];
  blockGrid = [];
  mineNumGrid = [];
  firstClick = [];
  clearedBlocks = new Set();
  gameOver = false;
  const minesweeperDiv = document.getElementById("minesweeper_game");
  minesweeperDiv.innerHTML = null;
  face = document.getElementById("minesweeper_face");
  face.className = "";
  face.addEventListener("click", generateMinesweeper);

  timerContainer = document.getElementById("minesweeper_timer");
  minesweeperTimerImages = Array.from(document.getElementById("minesweeper_timer").querySelectorAll("img"));
  minesweeperCountImages = Array.from(document.getElementById("minesweeper_score").querySelectorAll("img"));
  resetMinesweeper();
  minesweeperTimerInterval = setInterval(updateMinesweeperTimer, 1000);

  for (let i = 0; i < minesweeperSize; i++) {
    let currMinesRow = [];
    let currBlockRow = [];
    let currMineNumRow = [];
    for (let j = 0; j < minesweeperSize; j++) {
      const currBlock = document.createElement("div");
      currBlock.classList.add("minesweeper_new");
      minesweeperDiv.appendChild(currBlock);
      currBlock.addEventListener("click", () => {
        clickBlock([i, j]);
      });
      currBlock.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        defuseBlock([i, j], currBlock);
      });
      currBlock.addEventListener("pointerdown", (event) => {
        if (event.button != 0) return;
        highlightBlock([i, j], currBlock);
      });

      currMinesRow.push(false);
      currBlockRow.push(currBlock);
      currMineNumRow.push(0);
    }
    minesGrid.push(currMinesRow);
    blockGrid.push(currBlockRow);
    mineNumGrid.push(currMineNumRow);
  }
}

/* paint */
let paintCanvas =  null;
let pencilButton = null;
let eraserButton = null;
let clearButton = null;
let drawing = false;
let usingPen = true;
const penClassName = "pen";
const eraserClassName = "eraser";
const paintedClassName = "painted";
const canvasSize = 150;
function generatePaint() {
  paintCanvas = document.getElementById("paint_canvas");
  pencilButton = document.getElementById("paint_toolbar_pencil");
  eraserButton = document.getElementById("paint_toolbar_eraser");
  clearButton = document.getElementById("paint_toolbar_clear");

  pencilButton.addEventListener("click", () => {
    paintCanvas.classList.remove(eraserClassName);
    paintCanvas.classList.add(penClassName);
    usingPen = true;
  })

  eraserButton.addEventListener("click", () => {
    paintCanvas.classList.remove(penClassName);
    paintCanvas.classList.add(eraserClassName);
    usingPen = false;
  })
  
  clearButton.addEventListener("click", () => {
    Array.from(paintCanvas.children).forEach((currPixel) => {
      currPixel.classList.remove(paintedClassName);
    })
  })

  paintCanvas.addEventListener("pointerdown", () => {
    drawing = true;
  })

  document.addEventListener("pointerup", () => {
    drawing = false;
  })

  for (let i=0; i<canvasSize**2; i++) {
    const currPixel = document.createElement("div");
    const currDetectionArea = document.createElement("div");
    currDetectionArea.addEventListener("pointerdown", () => {
      if (usingPen) {
        currPixel.classList.add(paintedClassName);
      } else {
        currPixel.classList.remove(paintedClassName);
      }
    })
    currDetectionArea.addEventListener("mouseover", () => {
      if (!drawing) return;
      if (usingPen) {
        currPixel.classList.add(paintedClassName);
      } else {
        currPixel.classList.remove(paintedClassName);
      }
    })
    currPixel.appendChild(currDetectionArea);
    paintCanvas.appendChild(currPixel);
  }
}

// stretches
let stretchTimers = [];
let stretchTimerIndex = 0;

const stretchDuration = 1;
let currTimerSecondsContainer = null;
let currTimerSeconds = 0;
let currTimerMinutesContainer = null;
let currTimerMinutes = stretchDuration;

let timerRunning = false;
let firstTime = true;

const activeTimerClassName = "active";
const inactiveTimerClassName = "inactive";
const clickableTimerClassName = "clickable";

let stretchInterval = null;

const stretchNotificationAudio = new Audio("assets/ding.flac");

function stopStretchTimer() {
  clearInterval(stretchInterval);
}
function countDown() {
  if (!timerRunning) return;
  if (currTimerMinutesContainer == null || currTimerSecondsContainer == null) return;
  currTimerSeconds -= 1;
  if (currTimerSeconds < 0) {
    currTimerMinutes -= 1;
    currTimerSeconds = 59;
    if (currTimerMinutes < 0) {
      currTimerMinutesContainer.innerHTML = "0";
      currTimerSecondsContainer.innerHTML = "00";
      switchTimer();
      return;
    }
  }
  currTimerMinutesContainer.innerHTML = currTimerMinutes;
  if (currTimerSeconds < 10) {
    currTimerSecondsContainer.innerHTML = "0" + currTimerSeconds;
  } else {
    currTimerSecondsContainer.innerHTML = currTimerSeconds;
  }
}
function toggleTimer() {
  stretchTimers[stretchTimerIndex].classList.toggle("active");
  timerRunning = !timerRunning;
}
function switchTimer() {
  stretchNotificationAudio.play();
  timerRunning = false;
  const previousTimer = stretchTimers[stretchTimerIndex];
  previousTimer.classList.remove("clickable");
  previousTimer.classList.remove("active");
  previousTimer.classList.add("inactive");

  stretchTimerIndex += 1;
  const currTimer = stretchTimers[stretchTimerIndex];
  if (currTimer == null) {
    return;
  }
  currTimer.classList.add("clickable");
  currTimer.classList.add("active");
  currTimerMinutesContainer = currTimer.querySelector(".stretches_timer_minutes");
  currTimerMinutes = stretchDuration;
  currTimerSecondsContainer = currTimer.querySelector(".stretches_timer_seconds");
  currTimerSeconds = 0;
  currTimer.addEventListener("click", toggleTimer);
  timerRunning = true;
}
function generateStretches() {
  stretchTimers = Array.from(document.getElementsByClassName("stretches_timer"));
  stretchTimerIndex = 0;
  currTimerMinutes = stretchDuration;
  currTimerSeconds = 0;
  timerRunning = false;
  const currTimer = stretchTimers[stretchTimerIndex];
  currTimer.classList.add("clickable");
  currTimer.addEventListener("click", toggleTimer);
  currTimerMinutesContainer = currTimer.querySelector(".stretches_timer_minutes");
  currTimerSecondsContainer = currTimer.querySelector(".stretches_timer_seconds");

  stretchInterval = setInterval(countDown, 1000);
}

console.log("If you are reading this follow me :)");
