package com.example.parking.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.example.parking.model.Booking;
import com.example.parking.model.ParkingSlot;
import com.example.parking.model.User;
import com.example.parking.model.WaitingQueue;
import com.example.parking.repository.BookingRepository;
import com.example.parking.repository.ParkingSlotRepository;
import com.example.parking.repository.UserRepository;
import com.example.parking.repository.WaitingQueueRepository;

@Service
public class BookingService {

    private static final int MAX_CAPACITY = 50;

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ParkingSlotRepository slotRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private WaitingQueueRepository waitingQueueRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    // ─────────────────────────────────────────────
    // 🧠 SMART SLOT NAME GENERATOR
    // ─────────────────────────────────────────────
    private String generateNextSlotNumber() {
        List<ParkingSlot> all = slotRepository.findAll();
        if (all.isEmpty()) return "A1";

        String last = all.stream()
                .map(ParkingSlot::getSlotNumber)
                .filter(s -> s.length() >= 2)
                .max(Comparator.comparingInt(s -> {
                    char zone = s.charAt(0);
                    int num = Integer.parseInt(s.substring(1));
                    return (zone - 'A') * 100 + num;
                }))
                .orElse("A0");

        char zone = last.charAt(0);
        int num = Integer.parseInt(last.substring(1));

        if (num < 9) return zone + String.valueOf(num + 1);
        char nextZone = (char) (zone + 1);
        if (nextZone > 'Z') throw new RuntimeException("Parking lot is at maximum capacity.");
        return nextZone + "1";
    }

    // ─────────────────────────────────────────────
    // 🏗️ AUTO CREATE SLOT
    // ─────────────────────────────────────────────
    private ParkingSlot createNewSlot() {
        String slotNumber = generateNextSlotNumber();
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(slotNumber);
        slot.setAvailable(true);
        return slotRepository.save(slot);
    }

    // ─────────────────────────────────────────────
    // 🛡️ ENSURE BUFFER SLOT EXISTS (respects cap)
    // ─────────────────────────────────────────────
    private void ensureAvailableSlotExists() {
        List<ParkingSlot> available = slotRepository.findByAvailableTrue();
        if (available.isEmpty() && slotRepository.count() < MAX_CAPACITY) {
            createNewSlot();
        }
    }

    // ─────────────────────────────────────────────
    // 🚗 BOOK SLOT — auto assign or queue
    // ─────────────────────────────────────────────
    @Transactional
    public Booking bookSlot(String email, String slotNumber) {

        // 1. Check existing active booking
        if (!bookingRepository.findByUserEmailAndActiveTrue(email).isEmpty()) {
            throw new RuntimeException("You already have an active booking.");
        }

        // 2. Check if already in queue
        if (waitingQueueRepository.existsByUserEmail(email)) {
            throw new RuntimeException("You are already in the waiting queue.");
        }

        ParkingSlot slot;

        if (slotNumber != null && !slotNumber.isBlank()) {
            // Manual slot selection
            slot = slotRepository.findBySlotNumberIgnoreCase(slotNumber)
                    .orElseThrow(() -> new RuntimeException("Slot not found: " + slotNumber));
            if (!slot.isAvailable()) {
                throw new RuntimeException("Slot " + slotNumber + " is already booked.");
            }
        } else {
            // Auto-assign
            List<ParkingSlot> available = slotRepository.findByAvailableTrue()
                    .stream()
                    .sorted(Comparator.comparing(ParkingSlot::getSlotNumber))
                    .toList();

            if (available.isEmpty()) {
                long total = slotRepository.count();
                if (total >= MAX_CAPACITY) {
                    // 🚦 PARKING FULL → add to waiting queue
                    WaitingQueue entry = new WaitingQueue();
                    entry.setUserEmail(email);
                    entry.setRequestTime(LocalDateTime.now());
                    waitingQueueRepository.save(entry);
                    messagingTemplate.convertAndSend("/topic/slots", "UPDATED");
                    throw new RuntimeException("Parking is full. You have been added to the waiting queue.");
                }
                slot = createNewSlot();
            } else {
                slot = available.get(0);
            }
        }

        return assignSlotToUser(email, slot);
    }

    // ─────────────────────────────────────────────
    // ✨ AUTO BOOK shortcut
    // ─────────────────────────────────────────────
    @Transactional
    public Booking autoBookSlot(String email) {
        return bookSlot(email, null);
    }

    // ─────────────────────────────────────────────
    // 🔧 INTERNAL: assign slot and create booking
    // ─────────────────────────────────────────────
    private Booking assignSlotToUser(String email, ParkingSlot slot) {
        slot.setAvailable(false);
        slotRepository.save(slot);

        Booking booking = new Booking();
        booking.setUserEmail(email);
        booking.setSlotNumber(slot.getSlotNumber());
        booking.setActive(true);
        Booking saved = bookingRepository.save(booking);

        ensureAvailableSlotExists();
        messagingTemplate.convertAndSend("/topic/slots", "UPDATED");
        return saved;
    }

    // ─────────────────────────────────────────────
    // 🔓 RELEASE SLOT — auto-assign to queue if any
    // ─────────────────────────────────────────────
    @Transactional
    public Booking releaseSlot(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ParkingSlot slot = slotRepository.findBySlotNumberIgnoreCase(booking.getSlotNumber())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Calculate cost
        booking.setExitTime(LocalDateTime.now());
        Duration duration = Duration.between(booking.getBookingTime(), booking.getExitTime());
        long hours = Math.max(1, (long) Math.ceil(duration.toMinutes() / 60.0));
        booking.setCost(hours * 20.0);
        booking.setActive(false);
        bookingRepository.save(booking);

        // Check waiting queue — FIFO
        Optional<WaitingQueue> nextInQueue = waitingQueueRepository.findFirstByOrderByRequestTimeAsc();

        if (nextInQueue.isPresent()) {
            WaitingQueue queued = nextInQueue.get();
            waitingQueueRepository.delete(queued);
            // Auto-assign freed slot to queued user
            assignSlotToUser(queued.getUserEmail(), slot);
        } else {
            // No one waiting — just free the slot
            slot.setAvailable(true);
            slotRepository.save(slot);
            messagingTemplate.convertAndSend("/topic/slots", "UPDATED");
        }

        return booking;
    }

    // ─────────────────────────────────────────────
    // ❌ CANCEL BOOKING
    // ─────────────────────────────────────────────
    @Transactional
    public String cancelBooking(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserEmail().equals(email)) {
            throw new RuntimeException("Not allowed to cancel this booking");
        }

        booking.setActive(false);
        bookingRepository.save(booking);

        ParkingSlot slot = slotRepository.findBySlotNumberIgnoreCase(booking.getSlotNumber())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // Check queue on cancel too
        Optional<WaitingQueue> nextInQueue = waitingQueueRepository.findFirstByOrderByRequestTimeAsc();
        if (nextInQueue.isPresent()) {
            WaitingQueue queued = nextInQueue.get();
            waitingQueueRepository.delete(queued);
            assignSlotToUser(queued.getUserEmail(), slot);
        } else {
            slot.setAvailable(true);
            slotRepository.save(slot);
            messagingTemplate.convertAndSend("/topic/slots", "UPDATED");
        }

        return "Booking cancelled successfully";
    }

    // ─────────────────────────────────────────────
    // 🚪 LEAVE QUEUE
    // ─────────────────────────────────────────────
    @Transactional
    public String leaveQueue(String email) {
        if (!waitingQueueRepository.existsByUserEmail(email)) {
            throw new RuntimeException("You are not in the waiting queue.");
        }
        waitingQueueRepository.deleteByUserEmail(email);
        return "You have been removed from the waiting queue.";
    }

    // ─────────────────────────────────────────────
    // 📋 QUEUE STATUS for user
    // ─────────────────────────────────────────────
    public int getQueuePosition(String email) {
        List<WaitingQueue> queue = waitingQueueRepository.findAllByOrderByRequestTimeAsc();
        for (int i = 0; i < queue.size(); i++) {
            if (queue.get(i).getUserEmail().equals(email)) return i + 1;
        }
        return -1; // not in queue
    }

    // ─────────────────────────────────────────────
    // 📋 MY BOOKINGS
    // ─────────────────────────────────────────────
    public List<Booking> myBookings(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    // ─────────────────────────────────────────────
    // 📜 BOOKING HISTORY BY USER ID
    // ─────────────────────────────────────────────
    public List<Booking> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserEmail(user.getEmail());
    }
}
