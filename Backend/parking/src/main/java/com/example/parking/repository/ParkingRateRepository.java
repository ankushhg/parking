package com.example.parking.repository;

import com.example.parking.entity.ParkingRate;
import com.example.parking.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ParkingRateRepository extends JpaRepository<ParkingRate, Long> {
    Optional<ParkingRate> findByVehicleType(VehicleType vehicleType);
}
