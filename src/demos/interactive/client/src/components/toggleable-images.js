export default function ({ data, handleClick }) {
  const imageElements = data.map((datum) => {
    const styles = { opacity: datum.enabled ? 1 : 0.3 };

    return (
      <img
        src={`/images/${datum.path}/${datum.name}.png`}
        key={datum.name}
        title={datum.description}
        style={styles}
        onClick={() => handleClick(datum.name)}
      />
    );
  });

  return (
    <div id="object-images" className="dynamic-panel-elements">
      {imageElements}
    </div>
  );
}
