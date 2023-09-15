import chalk from "chalk";
import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { compile } from "./compiler.js";
import { registerRoutes, mapRouteToTemplate } from "./router.js";
import { registerHomeRoute } from "./home-page.js";
import {
  registerSocket,
  injectClientSocketScript,
  sendMessage,
} from "./socket.js";
import { watchForChanges } from "./watcher.js";
import { exceptionToHtml } from "./exception-to-html.js";
import { getConfig } from "./config.js";

function getHttpServer(params) {
  const { app } = params;
  const { server: serverConfig } = getConfig();
  const httpsEnabled = serverConfig.httpsEnabled;

  if (!httpsEnabled) {
    const httpServer = http.createServer(app);
    return httpServer;
  }

  if (!serverConfig.httpsKeyPath) {
    throw new Error(
      "'httpsKeyPath' is required. Please add it to the jsx-email-builder.json file",
    );
  }
  if (!serverConfig.httpsCertPath) {
    throw new Error(
      "'httpsCertPath' is required.  Please add it to the jsx-email-builder.json file",
    );
  }
  const httpsKeyPath = path.join(process.cwd(), serverConfig.httpsKeyPath);
  const httpsCertPath = path.join(process.cwd(), serverConfig.httpsCertPath);
  if (!fs.existsSync(httpsKeyPath)) {
    throw new Error(
      `The file specified in 'httpsKeyPath' doesn't exist: ${serverConfig.httpsKeyPath}`,
    );
  }
  if (!fs.existsSync(httpsCertPath)) {
    throw new Error(
      `The file specified in 'httpsCertPath' doesn't exist: ${serverConfig.httpsCertPath}`,
    );
  }
  const httpServer = https.createServer(
    {
      key: fs.readFileSync(httpsKeyPath),
      cert: fs.readFileSync(httpsCertPath),
    },
    app,
  );
  return httpServer;
}

async function startServer() {
  const {
    templates: { templatesDir, templatesPostfix },
    server: { port, componentsOutsideTemplatesDirPaths },
  } = getConfig();
  const app = express();

  const httpServer = getHttpServer({ app });

  registerSocket({ httpServer });

  await registerRoutes(
    {
      templatesDir,
      templatesPostfix,
      httpServer: app,
    },
    handleRequest,
  );

  registerHomeRoute({
    httpServer: app,
    templatesDir,
    templatesPostfix,
  });

  watchForChanges({
    callback: (_type, file) => sendMessage("change", { file }),
    paths: [templatesDir, ...componentsOutsideTemplatesDirPaths],
  });

  httpServer.listen(port, () => {
    console.log("[JSX-Email-Builder] " + chalk.green.bold("Server started"));
    console.log(
      `[JSX-Email-Builder] Email templates are served on port ${port}`,
    );
  });
}

/**
 * @param {{ req: express.Request; res: express.Response; templatesDir: string; templatesPostfix: string; }} context
 */
async function handleRequest(context) {
  const { req, res, templatesDir, templatesPostfix } = context;
  try {
    const templateRelativePath = mapRouteToTemplate({
      req,
      templatesDir,
      templatesPostfix,
    });
    const templatePath = path.join(process.cwd(), templateRelativePath);

    if (!fs.existsSync(templatePath)) {
      res.status(404).send("404 - Not Found");
      return;
    }

    const defaultLang = req.query.lang?.toString() || "en";
    let result = await compile({
      templatePath,
      i18nEnabled: true,
      defaultLang,
    });
    let html = result.html;
    if (!req.query.patch) {
      html = injectClientSocketScript({ html: result.html });
    }
    res.send(html);
  } catch (e) {
    console.log(e);
    let html = exceptionToHtml(e);
    if (!req.query.patch) {
      html = injectClientSocketScript({ html });
    }
    res.status(500).send(html);
  }
}

export default startServer;
