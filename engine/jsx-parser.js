import { JSDOM } from "jsdom";

export function setupJsxFactory() {
  const dom = new JSDOM("<!DOCTYPE html>");

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

function getCssValue(value) {
  if (typeof value === "number") {
    return value === 0 ? 0 : value + "px";
  }
  return value;
}

function createElement(component, props, ...children) {
  const { window } = global.jsx.dom;
  const { document } = window;

  // component is a jsx component
  const componentIsJsxComponent = typeof component === "function";
  if (componentIsJsxComponent) {
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
          element.style[getCssKey(styleKey)] = getCssValue(
            props[key][styleKey]
          );
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
    createChildren(element, children);
  }

  return element;
}

function createChildren(element, children) {
  const { window } = global.jsx.dom;
  const { document } = window;

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (Array.isArray(child)) {
        createChildren(element, child);
      } else if (typeof child === "string") {
        element.appendChild(document.createTextNode(global.trans(child)));
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
          console.log({ element });
        }
        element.appendChild(child);
      } else if (child instanceof Object) {
        element.innerHTML = global.trans(
          child.trans?.text,
          child.trans.options
        );
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else {
    element.appendChild(children);
  }
}

// todo: test this
function createFragment(props, children) {
  const { window } = global.jsx.dom;
  const { document } = window;

  const fragment = document.createDocumentFragment();
  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          fragment.appendChild(document.createTextNode(child));
        } else if (child === null || child === undefined) {
          // do nothing
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
    } else {
      fragment.appendChild(document.createTextNode(children));
    }
  }
  return fragment;
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
    const fragment = createFragment({}, children);
    const wrapper = document.createElement("div");
    wrapper.appendChild(fragment);
    const childString = wrapper.innerHTML || "";
    if (!childString.trim()) {
      console.warn(
        "A conditional comment without content found! condition:",
        props.condition
      );
    }
    return document.createComment(
      `[if ${props.condition}]>\n${childString}\n<![endif]`
    );
  }

  if (children.length > 0) {
    const fragment = createFragment({}, children);
    return [comment, startComment, fragment, endComment];
  }
  return [comment, startComment, endComment];
}

function JsxObject(input) {
  this.input = input;
}
