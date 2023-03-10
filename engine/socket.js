import fs from "fs";
import { createServer } from "http";
import path from "path";
import url from "url";
import WebSocket, { WebSocketServer } from "ws";

let webSocketServer;

export function registerSocket(params) {
  const { express } = params;
  const httpServer = createServer(express);
  webSocketServer = new WebSocketServer({ server: httpServer });

  webSocketServer.on("connection", () => {
    console.log("Client connected");
  });

  return httpServer;
}

export function injectClientSocketScript(params) {
  const currentDir = path.dirname(url.fileURLToPath(import.meta.url));
  const { html } = params;
  const socketClient = fs.readFileSync(
    path.join(currentDir, "socket-client.js"),
    "utf8"
  );
  const finalHtml = html.replace(
    "</head>",
    `<script>${socketClient}</script></head>`
  );
  return finalHtml;
}

export function sendMessage(type, data) {
  webSocketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, ...data }));
    }
  });
}
