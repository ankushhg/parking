import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (onMessageReceived) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:3955/ws"),
    onConnect: () => {
      stompClient.subscribe("/topic/slots", onMessageReceived);
    },
  });

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) stompClient.deactivate();
};
