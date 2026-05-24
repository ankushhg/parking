package com.example.parking.repository;

import com.example.parking.entity.ParkingSlot;
import com.example.parking.enums.SlotStatus;
import com.example.parking.enums.VehicleType;
import com.example.parking.enums.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByZone(Zone zone);

    List<ParkingSlot> findByStatus(SlotStatus status);

    List<ParkingSlot> findByVehicleTypeAndStatus(VehicleType vehicleType, SlotStatus status);

    List<ParkingSlot> findByZoneAndVehicleTypeAndStatus(Zone zone, VehicleType vehicleType, SlotStatus status);

    Optional<ParkingSlot> findBySlotNumber(String slotNumber);

    long countByStatus(SlotStatus status);

    long countByVehicleTypeAndStatus(VehicleType vehicleType, SlotStatus status);
}
