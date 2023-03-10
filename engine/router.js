import { getEmailTemplatesList } from "./template-finder.js";
/**
 * Recursively traverses the templatesDir directory and its subfolders and returns an array of routes
 * @param {{ templatesDir: string; }} params
 * @returns {string[]}
 */
function createRoutesOfTemplates(params) {
  const { templatesDir } = params;
  const routes = [];
  const templatesPaths = getEmailTemplatesList({ templatesDir });
  templatesPaths.forEach((templatePath) => {
    routes.push(templatePath.replace(".template.tsx", ""));
  });
  return routes;
}

export async function registerRoutes(params, callback) {
  const { httpServer, templatesDir } = params;

  const routes = createRoutesOfTemplates({ templatesDir });
  routes.forEach((route) => {
    httpServer.get(route, (req, res) => {
      callback({ req, res, httpServer, templatesDir, routes: routes });
    });
  });

  console.log("following routes registered:", routes);
  return routes;
}

/**
 * @param {{ req: { url: string; }; }} params
 */
export function mapRouteToTemplate(params) {
  const { url } = params.req;
  const urlWithoutLastSlash = url.match(/\/$/) ? url.slice(0, -1) : url;
  const urlWithoutQuery = urlWithoutLastSlash.split("?")[0];
  const templatePath = `./email-templates${urlWithoutQuery}.template.tsx`;
  return templatePath;
}
