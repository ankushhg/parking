package com.example.parking.service;

import com.example.parking.dto.*;
import com.example.parking.entity.*;
import com.example.parking.enums.*;
import com.example.parking.repository.*;
import com.example.parking.websocket.SlotUpdatePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingService {

    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final ParkingRateRepository rateRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SlotUpdatePublisher slotUpdatePublisher;

    @Transactional
    public SessionResponse checkIn(Long userId, CheckInRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        sessionRepository.findByVehicleNumberAndStatus(request.getVehicleNumber(), SessionStatus.ACTIVE)
                .ifPresent(s -> { throw new IllegalStateException("Vehicle already checked in: " + request.getVehicleNumber()); });

        ParkingSlot slot;
        if (request.getSlotId() != null) {
            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
            if (slot.getStatus() != SlotStatus.AVAILABLE)
                throw new IllegalStateException("Slot " + slot.getSlotNumber() + " is not available");
            if (slot.getVehicleType() != request.getVehicleType())
                throw new IllegalStateException("Slot type mismatch. Slot " + slot.getSlotNumber() + " is for " + slot.getVehicleType() + " in Zone " + slot.getZone());
        } else {
            slot = autoAssignSlot(request.getVehicleType(), request.getPreferredZone());
        }

        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);

        ParkingSession session = ParkingSession.builder()
                .user(user)
                .slot(slot)
                .vehicleNumber(request.getVehicleNumber().toUpperCase())
                .vehicleType(request.getVehicleType())
                .checkIn(LocalDateTime.now())
                .status(SessionStatus.ACTIVE)
                .build();
        session = sessionRepository.save(session);

        auditLogRepository.save(AuditLog.builder()
                .performedBy(user.getEmail())
                .action("CHECK_IN")
                .details("Vehicle: " + session.getVehicleNumber() + " | Slot: " + slot.getSlotNumber())
                .build());

        slotUpdatePublisher.publishSlotUpdate(slot.getId(), SlotStatus.OCCUPIED);
        return toResponse(session);
    }

    @Transactional
    public SessionResponse checkOut(Long sessionId, String performedBy) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (session.getStatus() != SessionStatus.ACTIVE)
            throw new IllegalStateException("Session is not active");

        LocalDateTime checkOut = LocalDateTime.now();
        session.setCheckOut(checkOut);
        session.setStatus(SessionStatus.COMPLETED);

        long minutes = Duration.between(session.getCheckIn(), checkOut).toMinutes();
        double hours = Math.max(1.0, Math.ceil(minutes / 60.0)); // minimum 1 hour charge

        ParkingRate rate = rateRepository.findByVehicleType(session.getVehicleType())
                .orElseThrow(() -> new IllegalStateException("Rate not configured for " + session.getVehicleType()));
        BigDecimal amount = rate.getRatePerHour().multiply(BigDecimal.valueOf(hours));
        session.setAmountCharged(amount);

        ParkingSlot slot = session.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        sessionRepository.save(session);

        auditLogRepository.save(AuditLog.builder()
                .performedBy(performedBy)
                .action("CHECK_OUT")
                .details("Vehicle: " + session.getVehicleNumber() + " | Slot: " + slot.getSlotNumber() + " | Amount: ₹" + amount)
                .build());

        slotUpdatePublisher.publishSlotUpdate(slot.getId(), SlotStatus.AVAILABLE);
        return toResponse(session);
    }

    public List<SessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SlotResponse> getAvailableSlots(VehicleType vehicleType, Zone zone) {
        List<ParkingSlot> slots = (vehicleType != null && zone != null)
                ? slotRepository.findByZoneAndVehicleTypeAndStatus(zone, vehicleType, SlotStatus.AVAILABLE)
                : (vehicleType != null)
                    ? slotRepository.findByVehicleTypeAndStatus(vehicleType, SlotStatus.AVAILABLE)
                    : slotRepository.findByStatus(SlotStatus.AVAILABLE);
        return slots.stream()
                .sorted(java.util.Comparator.comparing(s -> s.getZone().name() + s.getSlotNumber()))
                .map(this::toSlotResponse).collect(Collectors.toList());
    }

    /**
     * Zone-wise auto-assignment:
     * - TWO_WHEELER   → Zone A only
     * - FOUR_WHEELER  → preferred zone (A or B), fallback to the other
     * - HEAVY_VEHICLE → Zone C only
     */
    private ParkingSlot autoAssignSlot(VehicleType vehicleType, Zone preferredZone) {
        List<Zone> zonePriority;
        switch (vehicleType) {
            case TWO_WHEELER:
                zonePriority = List.of(Zone.A);
                break;
            case HEAVY_VEHICLE:
                zonePriority = List.of(Zone.C);
                break;
            default: // FOUR_WHEELER
                if (preferredZone == Zone.A || preferredZone == Zone.B) {
                    zonePriority = preferredZone == Zone.A ? List.of(Zone.A, Zone.B) : List.of(Zone.B, Zone.A);
                } else {
                    zonePriority = List.of(Zone.A, Zone.B);
                }
        }
        for (Zone z : zonePriority) {
            List<ParkingSlot> available = slotRepository.findByZoneAndVehicleTypeAndStatus(z, vehicleType, SlotStatus.AVAILABLE);
            if (!available.isEmpty()) return available.get(0);
        }
        throw new IllegalStateException("No available slots for " + vehicleType + " in zones " + zonePriority);
    }

    public List<SlotResponse> getAllSlots() {
        return slotRepository.findAll().stream().map(this::toSlotResponse).collect(Collectors.toList());
    }

    public SessionResponse getActiveSessionByVehicle(String vehicleNumber) {
        return sessionRepository.findByVehicleNumberAndStatus(vehicleNumber.toUpperCase(), SessionStatus.ACTIVE)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("No active session for vehicle: " + vehicleNumber));
    }

    public SessionResponse toResponse(ParkingSession s) {
        long durationMinutes = s.getCheckOut() != null
                ? Duration.between(s.getCheckIn(), s.getCheckOut()).toMinutes()
                : Duration.between(s.getCheckIn(), LocalDateTime.now()).toMinutes();
        return SessionResponse.builder()
                .sessionId(s.getId())
                .vehicleNumber(s.getVehicleNumber())
                .vehicleType(s.getVehicleType())
                .slotNumber(s.getSlot().getSlotNumber())
                .zone(s.getSlot().getZone().name())
                .checkIn(s.getCheckIn())
                .checkOut(s.getCheckOut())
                .amountCharged(s.getAmountCharged())
                .status(s.getStatus())
                .userName(s.getUser().getName())
                .userPhone(s.getUser().getPhone())
                .durationMinutes(durationMinutes)
                .build();
    }

    public SlotResponse toSlotResponse(ParkingSlot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .slotNumber(slot.getSlotNumber())
                .zone(slot.getZone())
                .vehicleType(slot.getVehicleType())
                .status(slot.getStatus())
                .handicapReserved(slot.isHandicapReserved())
                .build();
    }
}
