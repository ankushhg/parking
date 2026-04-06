package com.example.parking.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.parking.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findBySlotNumberAndActiveTrue(String slotNumber);

    List<Booking> findByUserEmail(String email);

    List<Booking> findByUserEmailAndActiveTrue(String email);

    List<Booking> findByActiveTrueAndBookingTimeBefore(LocalDateTime cutoff);
}