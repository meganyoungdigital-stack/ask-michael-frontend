import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export function initWebSocket(server: any) {
  if (wss) return wss;

  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("🔌 Client connected");

    ws.on("close", () => {
      console.log("❌ Client disconnected");
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