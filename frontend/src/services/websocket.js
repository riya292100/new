import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnectCallback) {
    if (this.client && this.connected) {
      if (onConnectCallback) onConnectCallback();
      return;
    }

    try {
      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws-quickcart'),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.connected = true;
          if (onConnectCallback) onConnectCallback();
        },
        onDisconnect: () => {
          this.connected = false;
        },
        onStompError: (frame) => {
          console.warn('STOMP broker error:', frame.headers['message']);
        },
      });

      this.client.activate();
    } catch (err) {
      console.warn('WebSocket connection init failed, will use polling fallback:', err);
    }
  }

  subscribeToOrder(orderId, callback) {
    if (!this.client || !this.connected) {
      this.connect(() => {
        this.doSubscribe(`/topic/orders/${orderId}`, callback);
      });
      return () => {};
    }

    return this.doSubscribe(`/topic/orders/${orderId}`, callback);
  }

  subscribeToOrderLocation(orderId, callback) {
    if (!this.client || !this.connected) {
      this.connect(() => {
        this.doSubscribe(`/topic/orders/${orderId}/location`, callback);
      });
      return () => {};
    }

    return this.doSubscribe(`/topic/orders/${orderId}/location`, callback);
  }

  doSubscribe(destination, callback) {
    if (!this.client || !this.connected) return () => {};

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        callback(message.body);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
