package com.example.parking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.parking.model.Slot;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    // find slot by slot number
    Optional<Slot> findBySlotNumberIgnoreCase(String slotNumber);
}