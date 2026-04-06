import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (onSlotsUpdate, userEmail, onQueueAssigned) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:3955/ws"),
    onConnect: () => {
      stompClient.subscribe("/topic/slots", onSlotsUpdate);
      if (userEmail && onQueueAssigned) {
        stompClient.subscribe(`/topic/queue-assigned/${userEmail}`, (msg) => {
          onQueueAssigned(msg.body);
        });
      }
    },
  });

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) stompClient.deactivate();
};
