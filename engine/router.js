import express from "express";
import { getEmailTemplatesList } from "./template-finder.js";
import { getConfig } from "./config.js";

/**
 * Recursively traverses the templatesDir directory and its subfolders and returns an array of routes
 * @returns {string[]}
 */
export function getRoutesOfTemplates() {
  const {
    templates: { templatesPostfix },
  } = getConfig();

  const routes = [];
  const templatesPaths = getEmailTemplatesList();
  templatesPaths.forEach((templatePath) => {
    routes.push(templatePath.replace(templatesPostfix, ""));
  });
  return routes;
}

export async function registerRoutes(params, callback) {
  const { httpServer } = params;
  const {
    templates: { templatesDir, templatesPostfix },
  } = getConfig();

  const routes = getRoutesOfTemplates();
  routes.forEach((route) => {
    httpServer.get(route, (req, res) => {
      callback({
        req,
        res,
        httpServer,
        templatesDir,
        templatesPostfix,
        routes: routes,
      });
    });
  });

  // todo: log only in debug mode:
  // console.log("following routes registered:", routes);
  return routes;
}

/**
 * @param {{ req: express.Request; templatesDir: string; templatesPostfix: string; }} params
 */
export function mapRouteToTemplate(params) {
  const { url } = params.req;
  const { templatesDir, templatesPostfix } = params;
  const urlWithoutLastSlash = url.match(/\/$/) ? url.slice(0, -1) : url;
  const urlWithoutQuery = urlWithoutLastSlash.split("?")[0];
  const templatePath = `${templatesDir}${urlWithoutQuery}${templatesPostfix}`;
  return templatePath;
}
