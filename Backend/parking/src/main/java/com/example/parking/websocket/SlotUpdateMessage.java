package com.example.parking.websocket;

import lombok.Builder;
import lombok.Data;
import com.example.parking.enums.SlotStatus;

@Data
@Builder
public class SlotUpdateMessage {
    private Long slotId;
    private SlotStatus status;
    private String timestamp;
}
