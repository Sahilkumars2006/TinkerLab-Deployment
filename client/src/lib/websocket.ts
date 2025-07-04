import { useEffect, useRef, useState } from "react";

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        // Call specific handler if registered
        const handler = messageHandlers.current.get(message.type);
        if (handler) {
          handler(message.data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected");
    }
  };

  const subscribe = (messageType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(messageType, handler);
    
    // Return unsubscribe function
    return () => {
      messageHandlers.current.delete(messageType);
    };
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
  };
}

// Hook for equipment status updates
export function useEquipmentUpdates() {
  const { subscribe } = useWebSocket();
  const [equipmentUpdates, setEquipmentUpdates] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe("equipment_update", (data) => {
      setEquipmentUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
    });

    return unsubscribe;
  }, [subscribe]);

  return equipmentUpdates;
}

// Hook for reservation notifications
export function useReservationNotifications() {
  const { subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe("reservation_notification", (data) => {
      setNotifications(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 notifications
    });

    return unsubscribe;
  }, [subscribe]);

  return notifications;
}
