// @ts-ignore
import generateEmailTemplate from "{{templatePath}}";

function main() {
  if (typeof generateEmailTemplate !== "function") {
    throw new Error("The email template doesn't export a function");
  }
  global.jsx.output = generateEmailTemplate();
}

main();
