package com.example.parking.scheduler;

import com.example.parking.entity.ParkingSession;
import com.example.parking.entity.ParkingSlot;
import com.example.parking.enums.SessionStatus;
import com.example.parking.enums.SlotStatus;
import com.example.parking.repository.ParkingSessionRepository;
import com.example.parking.repository.ParkingSlotRepository;
import com.example.parking.websocket.SlotUpdatePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ParkingExpiryScheduler {

    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final SlotUpdatePublisher slotUpdatePublisher;

    @Value("${parking.max-hours:24}")
    private int maxHours;

    @Scheduled(fixedDelay = 300000) // every 5 minutes
    @Transactional
    public void expireOverdueSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(maxHours);
        List<ParkingSession> expired = sessionRepository.findExpiredSessions(cutoff);
        for (ParkingSession session : expired) {
            session.setStatus(SessionStatus.EXPIRED);
            session.setCheckOut(LocalDateTime.now());
            session.setRemarks("Auto-expired after " + maxHours + " hours");
            ParkingSlot slot = session.getSlot();
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
            sessionRepository.save(session);
            slotUpdatePublisher.publishSlotUpdate(slot.getId(), SlotStatus.AVAILABLE);
            log.warn("Session {} expired for vehicle {}", session.getId(), session.getVehicleNumber());
        }
        if (!expired.isEmpty()) log.info("Expired {} overdue sessions.", expired.size());
    }
}
