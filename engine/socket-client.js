connectToServer();

function connectToServer() {
  const socket = new WebSocket("ws://" + window.location.host + "/");
  socket.addEventListener("open", handleSocketOpen);
  socket.addEventListener("message", handleSocketMessage);
  socket.addEventListener("close", handleSocketClose);
}

function reconnectToServer() {
  console.log("Reconnecting to server...");
  setTimeout(connectToServer, 3000);
}

function handleSocketMessage(event) {
  const data = JSON.parse(event.data);
  console.log("Message from server ", data);
  switch (data.type) {
    case "change":
      handleChange();
      break;
    default:
      console.error(`Unknown message type:${data.type}\nMessage data:${data}`);
  }
}

function handleSocketOpen() {
  console.log("Connected to server");
}

function handleSocketClose() {
  reconnectToServer();
}

function handleChange() {
  console.log("Checking for updates...");
  const url = `${window.location.href}?patch=true`;
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const newDocument = parser.parseFromString(html, "text/html");
      const newBody = newDocument.body;
      const oldBody = document.body;
      if (newBody.innerHTML === oldBody.innerHTML) {
        console.log("No changes detected");
        return;
      }
      oldBody.innerHTML = newBody.innerHTML;
      console.log("Changes applied");
    });
}
