import ToggleableImages from "./toggleable-images";
import { onExtensionSelected } from "../app";

export default function ({ world, setWorld }) {
  console.log("Rendering the extensions");

  const handleClick = (name) => onExtensionSelected(name, world, setWorld);

  const extensionsWithPath = world.extensions.map((extension) => {
    return { ...extension, path: "modules" };
  });

  return (
    <div className="panel">
      <h2>Extensions</h2>
      <ToggleableImages data={extensionsWithPath} handleClick={handleClick} />
    </div>
  );
}
