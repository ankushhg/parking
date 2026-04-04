package com.example.parking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.parking.model.ParkingSlot;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    Optional<ParkingSlot> findBySlotNumberIgnoreCase(String slotNumber);

    List<ParkingSlot> findByAvailableTrue();

    boolean existsBySlotNumber(String slotNumber);
}
