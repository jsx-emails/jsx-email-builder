import { trans } from "./i18n.js";

export function setupUtils() {
  global.variable = variable;
}

function variable(name) {
  // todo: get wrapper from args
  return `{{${name}}}`;
}

// converts string to html
function html(input) {
  // todo: check if input is only string or html tags no JSX components
  // todo: check if html tag is not a script tag
  const anyJsxComponent = /<[A-Z]+.*>.*<\/[A-Z]+>/;
  if (anyJsxComponent.test(input)) {
    throw new Error(
      "JSX components are not allowed in html function.\n" +
        "input was: " +
        input +
        "\n"
    );
  }
  return new global.jsx.JsxObject({ __html: input });
}
global.html = html;

/******************************************************
 * Subject utils
 * ***************************************************/
function setSubject(input) {
  const translatedSubject = trans(input);
  // if (global.outputs?.subject) {
  //   throw new Error(
  //     "Subject is already set to: " +
  //       global.outputs.subject +
  //       ".\n" +
  //       "You can only set subject once.\n" +
  //       `More info: got "${input}" as new subject.`
  //   );
  // }
  if (typeof translatedSubject !== "string") {
    throw new Error(
      "Subject must be a string. Instead got: " + translatedSubject
    );
  }
  if (translatedSubject.length > 255) {
    throw new Error(
      "Subject must be less than 255 characters. Instead got: " +
        translatedSubject.length
    );
  }
  if (translatedSubject.length === 0) {
    throw new Error("Subject must not be empty.");
  }

  const invalidCharacters = /[\n\r\t\0\b]/;
  if (invalidCharacters.test(translatedSubject)) {
    throw new Error(
      "Subject must not contain any of the following characters: \\n \\r \\t \\0 \\b"
    );
  }

  global.outputs = { ...global.outputs, subject: translatedSubject };
}
global.setSubject = setSubject;
