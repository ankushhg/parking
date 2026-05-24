package com.example.parking.service;

import com.example.parking.dto.*;
import com.example.parking.entity.*;
import com.example.parking.enums.*;
import com.example.parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ParkingSlotRepository slotRepository;
    private final ParkingSessionRepository sessionRepository;
    private final ParkingRateRepository rateRepository;
    private final AuditLogRepository auditLogRepository;
    private final ParkingService parkingService;

    public DashboardStats getDashboardStats() {
        long total = slotRepository.count();
        long available = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupied = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long activeSessions = sessionRepository.countActiveSessions();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        Double todayRev = sessionRepository.totalRevenueBetween(todayStart, now);
        Double totalRev = sessionRepository.totalRevenueBetween(LocalDateTime.of(2000, 1, 1, 0, 0), now);

        Map<String, Long> slotsByZone = slotRepository.findAll().stream()
                .collect(Collectors.groupingBy(s -> s.getZone().name(), Collectors.counting()));

        Map<String, Long> availableByType = Map.of(
                "TWO_WHEELER", slotRepository.countByVehicleTypeAndStatus(VehicleType.TWO_WHEELER, SlotStatus.AVAILABLE),
                "FOUR_WHEELER", slotRepository.countByVehicleTypeAndStatus(VehicleType.FOUR_WHEELER, SlotStatus.AVAILABLE),
                "HEAVY_VEHICLE", slotRepository.countByVehicleTypeAndStatus(VehicleType.HEAVY_VEHICLE, SlotStatus.AVAILABLE)
        );

        long sessionsToday = sessionRepository.findSessionsBetween(todayStart, now).size();

        return DashboardStats.builder()
                .totalSlots(total)
                .availableSlots(available)
                .occupiedSlots(occupied)
                .activeSessions(activeSessions)
                .todayRevenue(BigDecimal.valueOf(todayRev != null ? todayRev : 0))
                .totalRevenue(BigDecimal.valueOf(totalRev != null ? totalRev : 0))
                .slotsByZone(slotsByZone)
                .availableByVehicleType(availableByType)
                .totalUsers(userRepository.findByRole(Role.USER).size())
                .totalSessionsToday(sessionsToday)
                .build();
    }

    public List<SessionResponse> getAllActiveSessions() {
        return sessionRepository.findByStatus(SessionStatus.ACTIVE)
                .stream().map(parkingService::toResponse).collect(Collectors.toList());
    }

    public List<SessionResponse> getAllSessions() {
        return sessionRepository.findAll()
                .stream().map(parkingService::toResponse).collect(Collectors.toList());
    }

    public ReportResponse generateReport(LocalDateTime from, LocalDateTime to) {
        List<ParkingSession> sessions = sessionRepository.findSessionsBetween(from, to);
        Double revenue = sessionRepository.totalRevenueBetween(from, to);
        List<SessionResponse> responses = sessions.stream().map(parkingService::toResponse).collect(Collectors.toList());

        return ReportResponse.builder()
                .period(from + " to " + to)
                .totalSessions(sessions.size())
                .totalRevenue(BigDecimal.valueOf(revenue != null ? revenue : 0))
                .twoWheelerCount(sessions.stream().filter(s -> s.getVehicleType() == VehicleType.TWO_WHEELER).count())
                .fourWheelerCount(sessions.stream().filter(s -> s.getVehicleType() == VehicleType.FOUR_WHEELER).count())
                .heavyVehicleCount(sessions.stream().filter(s -> s.getVehicleType() == VehicleType.HEAVY_VEHICLE).count())
                .sessions(responses)
                .build();
    }

    @Transactional
    public SlotResponse updateSlotStatus(Long slotId, SlotStatus status) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        slot.setStatus(status);
        return parkingService.toSlotResponse(slotRepository.save(slot));
    }

    @Transactional
    public SlotResponse addSlot(SlotRequest request) {
        if (slotRepository.findBySlotNumber(request.getSlotNumber()).isPresent())
            throw new IllegalArgumentException("Slot number already exists: " + request.getSlotNumber());
        ParkingSlot slot = ParkingSlot.builder()
                .slotNumber(request.getSlotNumber())
                .zone(request.getZone())
                .vehicleType(request.getVehicleType())
                .status(request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE)
                .isHandicapReserved(request.isHandicapReserved())
                .build();
        return parkingService.toSlotResponse(slotRepository.save(slot));
    }

    @Transactional
    public void deleteSlot(Long slotId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        if (slot.getStatus() == SlotStatus.OCCUPIED)
            throw new IllegalStateException("Cannot delete an occupied slot");
        slotRepository.delete(slot);
    }

    @Transactional
    public ParkingRate updateRate(RateUpdateRequest request) {
        ParkingRate rate = rateRepository.findByVehicleType(request.getVehicleType())
                .orElse(ParkingRate.builder().vehicleType(request.getVehicleType()).build());
        rate.setRatePerHour(request.getRatePerHour());
        return rateRepository.save(rate);
    }

    public List<ParkingRate> getAllRates() {
        return rateRepository.findAll();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public SessionResponse adminCheckOut(Long sessionId, String adminEmail) {
        return parkingService.checkOut(sessionId, adminEmail);
    }
}
