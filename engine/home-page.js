/**
 * @param {{ httpServer: any; routes: string[]; }} params
 */
export function registerHomeRoute(params) {
  const { httpServer, routes } = params;

  httpServer.get("/", (req, res) => {
    const html = `
    <html>
      <head>
        <title>Home</title>
      </head>
      <body>
        <h1>Home</h1>
        <ul>
          ${routes
            .map((route) => {
              // last part of the route is the template name
              const templateName = route.split("/").pop();
              return `<li><a href="${route}">${templateName}</a></li>`;
            })
            .join("")}
        </ul>
      </body>
    </html>
  `;

    res.send(html);
  });
}
