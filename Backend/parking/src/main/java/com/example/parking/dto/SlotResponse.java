package com.example.parking.dto;

import com.example.parking.enums.SlotStatus;
import com.example.parking.enums.VehicleType;
import com.example.parking.enums.Zone;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SlotResponse {
    private Long id;
    private String slotNumber;
    private Zone zone;
    private VehicleType vehicleType;
    private SlotStatus status;
    private boolean handicapReserved;
}
