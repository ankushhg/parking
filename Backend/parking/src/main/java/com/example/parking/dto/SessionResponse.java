package com.example.parking.dto;

import com.example.parking.enums.SessionStatus;
import com.example.parking.enums.VehicleType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SessionResponse {
    private Long sessionId;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String slotNumber;
    private String zone;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private BigDecimal amountCharged;
    private SessionStatus status;
    private String userName;
    private String userPhone;
    private long durationMinutes;
}
