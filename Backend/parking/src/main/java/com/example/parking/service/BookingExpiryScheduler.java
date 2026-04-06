package com.example.parking.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.parking.model.Booking;
import com.example.parking.model.ParkingSlot;
import com.example.parking.model.WaitingQueue;
import com.example.parking.repository.BookingRepository;
import com.example.parking.repository.ParkingSlotRepository;
import com.example.parking.repository.WaitingQueueRepository;
import com.example.parking.repository.ParkingConfigRepository;

@Service
public class BookingExpiryScheduler {

    @Value("${parking.max-hours:24}")
    private int maxHours;

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ParkingSlotRepository slotRepository;
    @Autowired private WaitingQueueRepository waitingQueueRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private BookingService bookingService;
    @Autowired private ParkingConfigRepository configRepository;

    // Runs every 60 seconds
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireOldBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(maxHours);
        List<Booking> expired = bookingRepository.findByActiveTrueAndBookingTimeBefore(cutoff);

        for (Booking booking : expired) {
            // Calculate cost
            booking.setExitTime(LocalDateTime.now());
            Duration duration = Duration.between(booking.getBookingTime(), booking.getExitTime());
            long hours = Math.max(1, (long) Math.ceil(duration.toMinutes() / 60.0));
            double rate = configRepository.findById("hourly_rate")
                    .map(c -> Double.parseDouble(c.getValue())).orElse(20.0);
            booking.setCost(hours * rate);
            booking.setActive(false);
            bookingRepository.save(booking);

            ParkingSlot slot = slotRepository.findBySlotNumberIgnoreCase(booking.getSlotNumber()).orElse(null);
            if (slot == null) continue;

            // Assign to next in queue or free the slot
            Optional<WaitingQueue> next = waitingQueueRepository.findFirstByOrderByRequestTimeAsc();
            if (next.isPresent()) {
                WaitingQueue queued = next.get();
                waitingQueueRepository.delete(queued);
                bookingService.assignSlotToUserPublic(queued.getUserEmail(), slot);
            } else {
                slot.setAvailable(true);
                slotRepository.save(slot);
            }

            messagingTemplate.convertAndSend("/topic/slots", "UPDATED");
        }
    }
}
