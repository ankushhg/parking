package com.example.parking.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardStats {
    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private long activeSessions;
    private BigDecimal todayRevenue;
    private BigDecimal totalRevenue;
    private Map<String, Long> slotsByZone;
    private Map<String, Long> availableByVehicleType;
    private long totalUsers;
    private long totalSessionsToday;
}
