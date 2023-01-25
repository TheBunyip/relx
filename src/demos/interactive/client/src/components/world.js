import ClickableImages from "./clickable-images";
import { onThingSelected } from "../app";

export default function ({ world, selection, setSelection }) {
  console.log("Rendering the world");

  function onAddObject(event) {
    const name = document.getElementById("new-object-name").value;

    console.log("Sending add object:", name);

    // Post data using the Fetch API
    fetch("/add-object", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
  }

  const things = world.things
    .filter((thing) => {
      return !world.userInventory.includes(thing.name);
    })
    .map((thing) => thing.name);

  const handleClick = (name) =>
    onThingSelected(name, world, selection, setSelection);

  return (
    <div className="panel">
      <h2>WORLD</h2>
      <ClickableImages
        names={things}
        selection={selection}
        handleClick={handleClick}
      />
      <div id="add-object" className="add-object-form">
        <input
          id="new-object-name"
          type="text"
          name="name"
          placeholder="Type an object to import..."
        />
        <button onClick={onAddObject}>Add Object</button>
      </div>
    </div>
  );
}
