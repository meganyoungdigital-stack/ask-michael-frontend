import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export function initWebSocket(server: any) {
  if (wss) return wss;

  wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
    ws.on("close", () => {
      // connection closed
    });
  });

  return wss;
}

export function broadcast(data: any) {
  if (!wss) return;

  const message = JSON.stringify(data);

  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}