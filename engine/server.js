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
  const config = getConfig();
  const httpsEnabled = config.httpsEnabled;

  if (!httpsEnabled) {
    const httpServer = http.createServer(app);
    return httpServer;
  }

  if (!config.httpsKeyPath) {
    throw new Error(
      "'httpsKeyPath' is required. Please add it to the jsx-email-builder.json file"
    );
  }
  if (!config.httpsCertPath) {
    throw new Error(
      "'httpsCertPath' is required.  Please add it to the jsx-email-builder.json file"
    );
  }
  if (!fs.existsSync(config.httpsKeyPath)) {
    throw new Error(
      `The file specified in 'httpsKeyPath' doesn't exist: ${config.httpsKeyPath}`
    );
  }
  if (!fs.existsSync(config.httpsCertPath)) {
    throw new Error(
      `The file specified in 'httpsCertPath' doesn't exist: ${config.httpsCertPath}`
    );
  }
  const httpServer = https.createServer(
    {
      key: fs.readFileSync(config.httpsKeyPath),
      cert: fs.readFileSync(config.httpsCertPath),
    },
    app
  );
  return httpServer;
}

async function startServer(params) {
  const config = getConfig();
  const app = express();
  const port = params.port || config.port || 3000;
  const templatesDir =
    params.templatesDir || config.templatesDir || "./email-templates";
  const templatesPostFix =
    params.templatesPostFix || config.templatesPostFix || ".template.tsx";
  const componentsOutsideTemplatesDirPaths =
    config.componentsOutsideTemplatesDirPaths || [];

  const httpServer = getHttpServer({ app });

  registerSocket({ httpServer });

  await registerRoutes(
    {
      templatesDir,
      templatesPostFix,
      httpServer: app,
    },
    handleRequest
  );

  registerHomeRoute({
    httpServer: app,
    templatesDir,
    templatesPostFix,
  });

  watchForChanges({
    callback: (_type, file) => sendMessage("change", { file }),
    paths: [templatesDir, ...componentsOutsideTemplatesDirPaths],
  });

  httpServer.listen(port, () => {
    console.log(`Email templates are served on port ${port}`);
  });
}

/**
 * @param {{ req: express.Request; res: express.Response; templatesDir: string; templatesPostFix: string; }} context
 */
async function handleRequest(context) {
  const { req, res, templatesDir, templatesPostFix } = context;
  try {
    const templateRelativePath = mapRouteToTemplate({
      req,
      templatesDir,
      templatesPostFix,
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
