const imageElements = document.getElementById("object-images");
const buttonElements = document.getElementById("object-buttons");

async function refreshUI(world) {
  imageElements.innerHTML = "";
  imageElements.className = "";
  buttonElements.innerHTML = "";

  world.things.forEach((thing) => {
    // an image in the top panel
    const imageElement = document.createElement("img");
    imageElement.id = thing.name;
    imageElement.className = "selectable";
    imageElement.src = `/images/${thing.name}.png`;
    imageElements.appendChild(imageElement);

    imageElement.onclick = (event) => onThingSelected(event.target, world);
  });
}

async function onThingSelected(imageElement, world) {
  // are we selecting the first or second 'noun' here?
  const secondarySelection = imageElements.classList.contains(
    "secondary-selection"
  );

  if (secondarySelection) {
    // fire off an action on the server
    fetch("/attempt-action/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstNoun: world.selectedThing.name,
        secondNoun: imageElement.id,
        action: world.selectedAction,
      }),
    });
    delete world.selectedAction;
    delete world.selectedThing;
    refreshUI(world);
  } else {
    // highlight the selected thing and present action options
    if (world.selectedThing) {
      const lastSelectedImage = document.querySelector(
        `img#${world.selectedThing.name}`
      );
      if (lastSelectedImage) {
        lastSelectedImage.classList.remove("selected");
        imageElements.classList.remove("secondary-selection");
      }
    }

    const newSelection = world.things.find(
      (thing) => thing.name === imageElement.id
    );
    if (world.selectedThing !== newSelection) {
      world.selectedThing = newSelection;
      imageElement.classList.add("selected");
      imageElement.classList.remove("selectable");
    } else {
      world.selectedThing = null;
      imageElements.classList.remove("secondary-selection");
    }

    refreshButtons(world);
  }
}

async function refreshButtons(world) {
  buttonElements.innerHTML = "";

  if (world.selectedThing) {
    const response = await fetch(
      `/valid-actions-for-thing/${world.selectedThing.name}`
    );
    const actions = await response.json();
    actions.forEach((action) => {
      const buttonElement = document.createElement("button");
      buttonElement.innerText = action;
      buttonElements.appendChild(buttonElement);
      buttonElement.onclick = (event) => onActionSelected(event.target, world);
    });
  }
}

function onActionSelected(buttonElement, world) {
  buttonElement.classList.add("selected");
  imageElements.classList.add("secondary-selection");
  world.selectedAction = buttonElement.innerHTML;
}

const ws = new WebSocket(`ws://${location.host}`);

ws.onopen = () => {
  console.log("Websocket connected");

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.world) {
      refreshUI(payload.world);
    }
  };
};

document.getElementById("add-object").addEventListener("submit", (event) => {
  const form = event.target;

  // Post data using the Fetch API
  fetch("/add-object", {
    method: form.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: new FormData(form).get("name") }),
  });

  event.preventDefault();
});

(async function () {
  const response = await fetch("/world");
  const world = await response.json();
  console.log(world);
  refreshUI(world);
})();
