package com.example.parking.dto;

import com.example.parking.enums.VehicleType;
import com.example.parking.enums.Zone;
import lombok.Data;

@Data
public class CheckInRequest {
    private String vehicleNumber;
    private VehicleType vehicleType;
    private Zone preferredZone;
    private Long slotId; // optional: user can pick specific slot
}
