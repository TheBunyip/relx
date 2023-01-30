import ClickableThings from "./clickable-things";
import { onThingSelected } from "../app";

export default function ({ world, selection, setSelection }) {
  console.log("Rendering the inventory");

  const things = world.things
    .filter((thing) => {
      return world.userInventory.includes(thing.name);
    })
    .map((thing) => thing.name);

  const handleClick = (name) =>
    onThingSelected(name, world, selection, setSelection);

  return (
    <div className="panel">
      <h2>Inventory</h2>
      <ClickableThings
        names={things}
        selection={selection}
        handleClick={handleClick}
      />
    </div>
  );
}
