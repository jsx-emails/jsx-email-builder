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
