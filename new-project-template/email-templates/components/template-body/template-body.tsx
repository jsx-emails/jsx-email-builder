const styles = {
  body: {
    padding: "16px 24px",
    backgroundColor: "#f9f6f6",
    color: "#101010",
    fontSize: 14,
    border: "2px solid black",
  },
};

function TemplateBody(props: { children: JsxChildren }) {
  const { children } = props;

  return <div style={styles.body}>{children}</div>;
}

export default TemplateBody;
