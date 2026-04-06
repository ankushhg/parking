package com.example.parking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.parking.model.ParkingConfig;

public interface ParkingConfigRepository extends JpaRepository<ParkingConfig, String> {}
