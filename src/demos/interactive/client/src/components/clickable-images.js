export default function ({ names, selection, handleClick }) {
  const imageElements = names.map((name, index) => {
    const selectable =
      !selection.action ||
      selection.viableSecondThings.some((thingName) => name === thingName);

    return (
      <img
        src={`/images/${name}.png`}
        key={name}
        className={`${selectable ? "selectable" : ""} ${
          selection.thing === name ? "selected" : ""
        }`}
        onClick={() => handleClick(name)}
      />
    );
  });

  return (
    <div id="object-images" className="dynamic-panel-elements">
      {imageElements}
    </div>
  );
}
