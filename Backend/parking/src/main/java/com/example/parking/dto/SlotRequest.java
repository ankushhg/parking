package com.example.parking.dto;

import com.example.parking.enums.SlotStatus;
import com.example.parking.enums.VehicleType;
import com.example.parking.enums.Zone;
import lombok.Data;

@Data
public class SlotRequest {
    private String slotNumber;
    private Zone zone;
    private VehicleType vehicleType;
    private SlotStatus status;
    private boolean handicapReserved;
}
