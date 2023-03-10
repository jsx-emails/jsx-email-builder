export function exceptionToHtml(e) {
  let message = e.message.replace(/\n/, "<br />");
  message = message.replace(
    /'([./].*?)'/g,
    "<span class=\"string\">'$1'</span>"
  );
  const stackWithoutMessage = e.stack.replace(e.message, "");

  return `<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <div class="error">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: sans-serif;
          background-color: #f5f5f5;
        }
        .string {
          color: #4caf50;
        }
        .error {
          padding: 1rem;
          color: #333;
          margin: 1rem;
        }
        .error h1 {
          color: #f44336;
          margin: 0;
          font-size: 1.5rem;
        }
        .error p {
          color: #333;
          line-height: 1.45rem;
        }
        .error pre {
          white-space: pre-wrap;
          background-color: #333;
          color: #fff;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      </style>
        <h1>${e.name || "Error"}</h1>
        <p>${message}</p>
        <pre>${stackWithoutMessage}</pre>
      </div>
    </body>
  </html>`;
}
