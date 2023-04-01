import { HtmlComment } from "jsx-email-builder/components";

const styles = {
  footer: {
    backgroundColor: "#101010",
    color: "#fff",
    padding: "16px 24px",
    fontSize: 24,
  },
};

function Footer(props: { children: JsxChildren }) {
  const { children } = props;

  return (
    <HtmlComment startComment="Footer:Start" endComment="Footer:End">
      <div style={styles.footer}>{children}</div>
    </HtmlComment>
  );
}

export default Footer;
