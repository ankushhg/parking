package com.example.parking.entity;

import com.example.parking.enums.SlotStatus;
import com.example.parking.enums.VehicleType;
import com.example.parking.enums.Zone;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parking_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slotNumber; // e.g. A-01, B-05

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Zone zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status;

    @Builder.Default
    private boolean isHandicapReserved = false;
}
