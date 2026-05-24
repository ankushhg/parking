package com.example.parking.repository;

import com.example.parking.entity.ParkingSession;
import com.example.parking.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {

    List<ParkingSession> findByUserId(Long userId);

    List<ParkingSession> findByStatus(SessionStatus status);

    Optional<ParkingSession> findByVehicleNumberAndStatus(String vehicleNumber, SessionStatus status);

    List<ParkingSession> findByUserIdAndStatus(Long userId, SessionStatus status);

    @Query("SELECT ps FROM ParkingSession ps WHERE ps.status = 'ACTIVE' AND ps.checkIn < :cutoff")
    List<ParkingSession> findExpiredSessions(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COUNT(ps) FROM ParkingSession ps WHERE ps.status = 'ACTIVE'")
    long countActiveSessions();

    @Query("SELECT ps FROM ParkingSession ps WHERE ps.checkIn BETWEEN :from AND :to")
    List<ParkingSession> findSessionsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT SUM(ps.amountCharged) FROM ParkingSession ps WHERE ps.status = 'COMPLETED' AND ps.checkOut BETWEEN :from AND :to")
    Double totalRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
