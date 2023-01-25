import { onActionSelected } from "../app";

export default function ({ world, selection, setSelection }) {
  console.log("Rendering the actions");

  const buttonElements = selection.viableActions.map((action) => {
    return (
      <button
        key={action.name}
        onClick={() => onActionSelected(action, world, selection, setSelection)}
      >
        {action.name}
      </button>
    );
  });

  return (
    <div className="panel">
      <h2>Actions</h2>
      <div id="object-buttons" className="dynamic-panel-elements">
        {buttonElements}
      </div>
    </div>
  );
}
