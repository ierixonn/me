import { WebSocketServer } from 'ws';
import crypto from 'crypto-js';

// Хранилище в памяти (для демо)
const connections = new Set();

export default function handler(req, res) {
  if (!res.socket.server.wss) {
    const wss = new WebSocketServer({ noServer: true });
    
    wss.on('connection', (ws) => {
      connections.add(ws);
      
      ws.on('message', (message) => {
        // Дешифровка сообщения
        const decrypted = crypto.AES.decrypt(message.toString(), 'secret-key')
          .toString(crypto.enc.Utf8);
        
        // Рассылка всем подключенным клиентам
        connections.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(decrypted);
          }
        });
      });
      
      ws.on('close', () => connections.delete(ws));
    });

    res.socket.server.wss = wss;
  }

  // Обработка upgrade для WebSocket
  if (req.headers.upgrade === 'websocket') {
    res.socket.server.wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      res.socket.server.wss.emit('connection', ws, req);
    });
  } else {
    res.status(200).json({ status: 'WebSocket endpoint' });
  }
}
