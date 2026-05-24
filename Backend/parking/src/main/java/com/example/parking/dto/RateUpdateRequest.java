package com.example.parking.dto;

import com.example.parking.enums.VehicleType;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RateUpdateRequest {
    private VehicleType vehicleType;
    private BigDecimal ratePerHour;
}
