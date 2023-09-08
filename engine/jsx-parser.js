import { JSDOM } from "jsdom";
import { TRANSLATABLE_TAGS } from "./i18n.js";

export function setupJsxFactory() {
  const dom = new JSDOM("");

  global.jsx = {
    createElement,
    createFragment,
    JsxObject,
    dom,
  };
}

function getCssKey(key) {
  // todo: if key starts with capital letter, it is vendor specific
  return key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

function createElement(component, props, ...children) {
  const { window } = global.jsx.dom;
  const { document } = window;

  // component is a jsx component
  const componentIsJsxComponent = typeof component === "function";
  if (componentIsJsxComponent) {
    if (component.name === "Doctype") {
      addDoctype(props);
      return;
    }

    if (component.name === "HtmlComment") {
      return createElementFromHtmlComment(props, children);
    }

    const componentChildren = children.length === 1 ? children[0] : children;
    const returnedElement = component({
      ...props,
      children: componentChildren,
    });
    return returnedElement;
  }

  // component is a html tag
  const tag = component;
  const element = document.createElement(tag);
  if (props) {
    Object.keys(props).forEach((key) => {
      // if key starts with __ skip it
      if (key.startsWith("__")) {
        return;
      }

      if (key === "className") {
        element.setAttribute("class", props[key]);
      } else if (key === "style") {
        Object.keys(props[key]).forEach((styleKey) => {
          element.style[getCssKey(styleKey)] = props[key][styleKey];
        });
      } else if (key === "dangerouslySetInnerHTML") {
        element.innerHTML = props[key].__html;
        return element;
      } else {
        element.setAttribute(key, props[key]);
      }
    });
  }

  // create children
  if (children) {
    appendChildren(element, children);
  }

  return element;
}

function appendChildren(element, children, insideAChild = false) {
  const { window } = global.jsx.dom;
  const { document } = window;

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (Array.isArray(child)) {
        appendChildren(element, child, true);
      } else if (typeof child === "string") {
        const text = child;
        element.appendChild(document.createTextNode(text));
      } else if (child === null || child === undefined) {
        // do nothing
      } else if (typeof child === "function") {
        // todo: implement this
        throw new Error("function as child is not supported!");
        // const returnedElement = component({ ...props, children });
        // element.appendChild(returnedElement);
      } else if (child instanceof JsxObject) {
        element.innerHTML = child.input.__html;
      } else if (child instanceof window.Node) {
        if (!element.appendChild) {
          console.warn("unexpected node object:", { element });
          return;
        }
        element.appendChild(child);
      } else if (child instanceof Object) {
        // todo: this is not correct anymore:
        // element.innerHTML = global.trans(
        //   child.trans?.text,
        //   child.trans.options
        // );
        console.error(
          "Unimplemented code. Please report this issue.",
          "child is instanceof Object:\n\t" + child,
        );
      } else {
        console.error(
          "Unexpected child. Please report this issue.",
          "child:\n\t" + child,
        );
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else {
    element.appendChild(children);
  }

  // todo: check if translation is enabled
  if (!insideAChild) {
    translateChildren(element);
  }
}

function createFragment(props = {}) {
  const { children } = props;
  const { window } = global.jsx.dom;
  const { document } = window;

  const fragment = document.createDocumentFragment();
  let htmlElement;

  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          fragment.appendChild(document.createTextNode(child));
        } else if (child === null || child === undefined) {
          // do nothing
        } else if (child.nodeName === "HTML") {
          htmlElement = child;
          return;
        } else if (child instanceof window.Node) {
          fragment.appendChild(child);
        } else if (Array.isArray(child)) {
          child.forEach((grandchild) => {
            if (typeof grandchild === "string") {
              fragment.appendChild(document.createTextNode(grandchild));
            } else if (grandchild === null || grandchild === undefined) {
              // do nothing
            } else if (grandchild instanceof window.Node) {
              fragment.appendChild(grandchild);
            }
          });
        }
      });
    } else if (typeof children === "string") {
      fragment.appendChild(document.createTextNode(children));
    } else {
      throw new Error("unexpected children type");
    }
  }

  return htmlElement || fragment;
}

function addDoctype(props) {
  // if (global.jsx.doctype) {
  //   throw new Error("Doctype can only be added once!");
  // }
  global.jsx.doctype = `<!DOCTYPE ${props.attributes} >`;
}

function createElementFromHtmlComment(props, children) {
  const { window } = global.jsx.dom;
  const { document } = window;

  const startComment =
    props.startComment && document.createComment(props.startComment);
  const endComment =
    props.endComment && document.createComment(props.endComment);
  const comment = props.comment && document.createComment(props.comment);

  if (props.condition) {
    let childString;
    const childrenAreString = children.every(
      (child) => typeof child === "string",
    );
    if (childrenAreString) {
      childString = children.join("");
    } else {
      const fragment = createFragment({ children });
      const wrapper = document.createElement("div");
      wrapper.appendChild(fragment);
      childString = wrapper.innerHTML || "";
    }
    childString = childString.trim();

    if (!childString) {
      console.warn(
        "A conditional comment without content found! condition:",
        props.condition,
      );
    }
    if (props.alt) {
      return document.createComment(
        `[if ${props.condition}]><!-->\n${childString}\n<!--<![endif]`,
      );
    }
    return document.createComment(
      `[if ${props.condition}]>\n${childString}\n<![endif]`,
    );
  }

  if (children.length > 0) {
    const fragment = createFragment({ children });
    return [comment, startComment, fragment, endComment];
  }
  return [comment, startComment, endComment];
}

function translateChildren(element) {
  if (!TRANSLATABLE_TAGS.includes(element.nodeName)) {
    return;
  }

  let innerHTML = element.innerHTML;

  // if &nbsp; then skip translation
  if (innerHTML === "&nbsp;") {
    return;
  }

  // if includes tags other than `b`, `i`, `a`, and `br` tags, then skip translation.
  // translations should be applied to tags that only have text content and `b`, `i`, `a`, and `br` tags
  if (
    innerHTML.match(/<[^>]*>/g)?.some((tag) => {
      return !tag.match(/<[/]?([bia]|br)([ ]*>|\s[^>]*>)/g);
    })
  ) {
    return;
  }

  // split text by br tags to be able to translate each line separately
  const textParts = innerHTML.split(/<br[ /]*>/g);

  let translatedChildrenArray = [];
  for (let text of textParts) {
    // if after removing all variables, the text doesn't include any letters, then skip translation
    // todo: this won't work with non-english languages
    if (!text.replace(/{{[^}]*}}/g, "").match(/[a-zA-Z]/)) {
      return;
    }

    // remove extra spaces and new lines
    text = text
      .replace(/[\r\n]+/g, " ")
      .replace(/\s\s+/g, " ")
      .trim();
    // remove all attributes from tags but keep the content and tags
    text = text.replace(/<[^>]*>/g, (match) => {
      return match.replace(/<[^>]*>/, (match) => {
        return match.replace(/ [^=]+="[^"]*"/g, "");
      });
    });

    // translate text
    const translatedText = global.trans(text);

    // add back removed attributes to text using the original element inner html
    const translatedChildrenString = translatedText.replace(
      /<[^>]*>/g,
      (match) => {
        return match.replace(/<[^>]*>/, (match) => {
          const originalMatch = element.innerHTML.match(
            new RegExp(`<[^>]*${match.replace(/<|>/g, "")}[^>]*>`),
          );
          if (originalMatch) {
            return originalMatch[0];
          }
          return match;
        });
      },
    );

    translatedChildrenArray.push(translatedChildrenString);
  }

  // replace child nodes with translated content
  element.innerHTML = translatedChildrenArray.join("<br />");
}

function JsxObject(input) {
  this.input = input;
}
