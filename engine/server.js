import express from "express";
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

const app = express();
const port = 3000;

const httpServer = registerSocket({ express: app });

const routes = await registerRoutes(
  {
    templatesDir: "./email-templates",
    httpServer: app,
  },
  handleRequest
);

registerHomeRoute({
  httpServer: app,
  routes,
});

watchForChanges({
  callback: (_type, file) => sendMessage("change", { file }),
  path: "./email-templates",
});

httpServer.listen(port, () => {
  console.log(`Email templates are served on port ${port}`);
});

async function handleRequest(context) {
  const { req, res } = context;
  try {
    const templateRelativePath = mapRouteToTemplate({ req });
    const templatePath = path.join(process.cwd(), templateRelativePath);

    if (!fs.existsSync(templatePath)) {
      res.status(404).send("404 - Not Found");
      return;
    }

    let html = await compile({ templatePath });
    if (!req.query.patch) {
      html = injectClientSocketScript({ html });
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
