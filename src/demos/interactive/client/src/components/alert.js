function titleise(text) {
  // capitalise the first letter of the text
  if (text.length) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
}

export default function ({ alert, setAlert }) {
  if (alert.type) {
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, type: undefined }));
    }, 500);
  }

  const alertElement =
    alert.text && alert.text !== "" ? <p>{titleise(alert.text)}</p> : null;

  const styles = {
    visibility: alertElement ? "visible" : "hidden",
  };

  return (
    <div
      className={`panel ${alert.type ? alert.type + "-alert" : ""}`}
      style={styles}
    >
      {alertElement}
    </div>
  );
}
