import { getRoutesOfTemplates } from "./router.js";

function groupRoutesByFolder(routes) {
  const routesByFolder = {};
  routes.forEach((route) => {
    const routeParts = route.split("/");
    const folder = routeParts[1];
    const routeWithoutFolder = routeParts.slice(2).join("/");
    if (!routesByFolder[folder]) {
      routesByFolder[folder] = [];
    }
    routesByFolder[folder].push(routeWithoutFolder);
  });
  return routesByFolder;
}

/**
 * @param {{ httpServer: import('express').Express; templatesDir: string; templatesPostFix: string; }} params
 */
export function registerHomeRoute(params) {
  const { httpServer, templatesDir, templatesPostFix } = params;

  httpServer.get("/", (req, res) => {
    const routes = getRoutesOfTemplates({ templatesDir, templatesPostFix });

    const routesByFolder = groupRoutesByFolder(routes);

    const html = `
    <html>
      <head>
        <title>Home</title>
      </head>
      <body>
        <style>
          body {
            margin: 0;
            padding: clamp(1rem, 2vw, 3rem);
            font-family: "Open Sans", sans-serif;
            font-size: 0.8rem;
          }
          a {
            color: #0275d8;
            text-decoration: none;
          }
          .wrapper {
            max-width: 80rem;
            margin: 0 auto;
          }
          h1 {
            padding: 1rem 0;
            text-align: center;
          }
          h2 {
            text-transform:capitalize;
            font-weight: 500;
            color: #82c8c1;
          }
          ol {
            padding: 1rem 1rem 1rem 4em;
            border: 0.1rem solid #82c8c1;
            columns: 25rem;
            column-gap: 7rem;
            column-rule: 2px dotted #82c8c1;
            border-radius: 0.5rem;
          }
          ol > * + * {
            margin-top: 1rem;
          }
          li {
            break-inside: avoid;
          }
          ::marker {
            content: counters(list-item, '') ': ';
            font-weight: 700;
            font-size: 1.5em;
            color: #82c8c1;
          }
          .no-templates {
            text-align: center;
            padding: 1rem;
            color: #d9534f;
          }
        </style>
        <div class="wrapper">
        <h1>Templates</h1>
          ${
            routes.length === 0
              ? "<div class='no-templates'>No templates found</div>"
              : Object.keys(routesByFolder)
                  .map((folder) => {
                    const groupName = folder.replace(/[-_]/g, " ");
                    return `
                <h2>${groupName}</h2>
                <ol>
                  ${routesByFolder[folder]
                    .map((route) => {
                      let templateName = route.replace(/[-_]/g, " ");
                      templateName = templateName.replace(/[\\/]/g, " / ");
                      // capitalize first letter of each word
                      templateName = templateName.replace(
                        /\w\S*/g,
                        (txt) =>
                          txt.charAt(0).toUpperCase() +
                          txt.substring(1).toLowerCase()
                      );

                      return `<li><a href="${
                        folder + "/" + route
                      }">${templateName}</a></li>`;
                    })
                    .join("")}
                </ol>
              `;
                  })
                  .join("")
          }
      </body>
    </html>
  `;

    res.send(html);
  });
}
