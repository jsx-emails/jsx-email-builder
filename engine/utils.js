export function setupUtils() {
  global.variable = variable;
  global.setSubject = setSubject;
  global.addInternalStyles = addInternalStyles;
  clearInternalStyles();
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
        "\n",
    );
  }
  return new global.jsx.JsxObject({ __html: input });
}
global.html = html;

/******************************************************
 * Subject utils
 * ***************************************************/
function setSubject(input, options) {
  // if (global.outputs?.subject) {
  //   throw new Error(
  //     "Subject is already set to: " +
  //       global.outputs.subject +
  //       ".\n" +
  //       "You can only set subject once.\n" +
  //       `More info: got "${input}" as new subject.`
  //   );
  // }

  if (typeof input !== "string" && !Array.isArray(input)) {
    throw new Error(
      "Subject must be a string or an array of strings. Instead got: " +
        typeof input,
    );
  }
  global.outputs = {
    ...global.outputs,
    subject: input,
    subjectOptions: options,
  };
}

export function translateSubject(input, options) {
  const { separator = " " } = options || {};

  if (!input) {
    return "";
  }
  // if array, join with separator
  let translatedSubject;
  if (Array.isArray(input)) {
    translatedSubject = input.reduce((acc, curr) => {
      if (acc) {
        acc += separator;
      }
      return acc + global.trans(curr);
    }, "");
  } else {
    translatedSubject = global.trans(input);
  }

  if (translatedSubject.length > 255) {
    throw new Error(
      "Subject must be less than 255 characters. Instead got: " +
        translatedSubject.length,
    );
  }

  const invalidCharacters = /[\n\r\t\0\b]/;
  if (invalidCharacters.test(translatedSubject)) {
    throw new Error(
      "Subject must not contain any of the following characters: \\n \\r \\t \\0 \\b",
    );
  }

  return translatedSubject;
}

/******************************************************
 * Styling utils
 * ***************************************************/

// todo: bug: for each component, addInternalStyles gets called twice
function addInternalStyles(...styles) {
  for (const style of styles) {
    if (typeof style !== "string") {
      throw new Error(
        "addInternalStyles only accepts strings. Instead got: " + style,
      );
    }
    global.outputs.internalStyles.add(style);
  }
}

function clearInternalStyles() {
  global.outputs = { ...global.outputs, internalStyles: new Set() };
}
