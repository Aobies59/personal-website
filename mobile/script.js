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

  const appElem  = appTemplates[appName];
  document.body.appendChild(appElem);

  appOpen = appElem;

  if (hasBrightBackground(appElem)) {
    navigationPill.style.backgroundColor = "black";
  } else {
    navigationPill.style.backgroundColor = "white";
  }
}

Array.from(appsContainerElem.children)
  .forEach(app => {
    app.addEventListener("click", () => {
      openApp(app.dataset.name);
    })
  });

navigationPill.addEventListener("click", () => {
  if (appOpen == null) {
    return;
  }
  document.body.removeChild(appOpen);
  appOpen = null;
  document.body.appendChild(appsContainerElem);
  document.body.appendChild(footerElem);
  navigationPill.style.backgroundColor = "white";
})

// made with ChatGpt
function hasBrightBackground(elem) {
  const color = window.getComputedStyle(elem).backgroundColor;
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 128;
}
