function EmailTemplate(props: { children: JsxChildren }) {
  const { children } = props;
  return (
    <html>
      <head></head>
      <body>{children}</body>
    </html>
  );
}

export default EmailTemplate;
