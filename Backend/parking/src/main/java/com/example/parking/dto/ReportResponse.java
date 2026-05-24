package com.example.parking.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReportResponse {
    private String period;
    private long totalSessions;
    private BigDecimal totalRevenue;
    private long twoWheelerCount;
    private long fourWheelerCount;
    private long heavyVehicleCount;
    private List<SessionResponse> sessions;
}
