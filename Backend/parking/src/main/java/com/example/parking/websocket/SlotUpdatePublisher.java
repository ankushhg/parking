package com.example.parking.websocket;

import com.example.parking.enums.SlotStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class SlotUpdatePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishSlotUpdate(Long slotId, SlotStatus status) {
        SlotUpdateMessage message = SlotUpdateMessage.builder()
                .slotId(slotId)
                .status(status)
                .timestamp(LocalDateTime.now().toString())
                .build();
        messagingTemplate.convertAndSend("/topic/slots", message);
    }
}
