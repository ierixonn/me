import { useState, useEffect, useRef } from 'react';
import crypto from 'crypto-js';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    // Подключение к WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}/api`);
    
    ws.current.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && ws.current) {
      // Шифрование сообщения перед отправкой
      const encrypted = crypto.AES.encrypt(message, 'secret-key').toString();
      ws.current.send(encrypted);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Простой мессенджер</h1>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Отправить</button>
    </div>
  );
}
