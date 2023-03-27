const styles = {
  header: {
    backgroundColor: "#101010",
    color: "#fff",
    padding: "16px 24px",
    fontSize: 24,
  },
};

function Header(props: { children: JsxChildren }) {
  const { children } = props;

  return <div style={styles.header}>{children}</div>;
}

export default Header;
