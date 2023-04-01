import { HtmlComment } from "jsx-email-builder/components";

function EmailTemplate(props: { children: JsxChildren }) {
  const { children } = props;
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width" />
        <HtmlComment condition="mso | IE">
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        </HtmlComment>
      </head>
      <body>{children}</body>
    </html>
  );
}

export default EmailTemplate;
