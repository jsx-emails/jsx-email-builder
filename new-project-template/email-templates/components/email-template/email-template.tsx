import { HtmlComment } from "jsx-email-builder/components";
import { Doctype } from "jsx-email-builder/components";

function EmailTemplate(props: { children: JsxChildren }) {
  const { children } = props;
  return (
    <>
      <Doctype
        attributes={`html PUBLIC "-//W3C//DTD html 4.0 Transitional//EN"`}
      />
      <html>
        <head>
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width" />
          <HtmlComment condition="!mso" alt>
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          </HtmlComment>
        </head>
        <body>{children}</body>
      </html>
    </>
  );
}

export default EmailTemplate;
