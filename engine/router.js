import express from "express";
import { getEmailTemplatesList } from "./template-finder.js";

/**
 * Recursively traverses the templatesDir directory and its subfolders and returns an array of routes
 * @param {{ templatesDir: string; templatesPostFix:string; }} params
 * @returns {string[]}
 */
function createRoutesOfTemplates(params) {
  const { templatesDir, templatesPostFix } = params;
  const routes = [];
  const templatesPaths = getEmailTemplatesList({
    templatesDir,
    templatesPostFix,
  });
  templatesPaths.forEach((templatePath) => {
    routes.push(templatePath.replace(templatesPostFix, ""));
  });
  return routes;
}

export async function registerRoutes(params, callback) {
  const { httpServer, templatesDir, templatesPostFix } = params;

  const routes = createRoutesOfTemplates({ templatesDir, templatesPostFix });
  routes.forEach((route) => {
    httpServer.get(route, (req, res) => {
      callback({
        req,
        res,
        httpServer,
        templatesDir,
        templatesPostFix,
        routes: routes,
      });
    });
  });

  console.log("following routes registered:", routes);
  return routes;
}

/**
 * @param {{ req: express.Request; templatesDir: string; templatesPostFix: string; }} params
 */
export function mapRouteToTemplate(params) {
  const { url } = params.req;
  const { templatesDir, templatesPostFix } = params;
  const urlWithoutLastSlash = url.match(/\/$/) ? url.slice(0, -1) : url;
  const urlWithoutQuery = urlWithoutLastSlash.split("?")[0];
  const templatePath = `${templatesDir}${urlWithoutQuery}${templatesPostFix}`;
  return templatePath;
}
