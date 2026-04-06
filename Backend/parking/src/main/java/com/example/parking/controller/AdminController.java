package com.example.parking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.parking.model.Booking;
import com.example.parking.model.ParkingConfig;
import com.example.parking.model.ParkingSlot;
import com.example.parking.model.User;
import com.example.parking.model.WaitingQueue;
import com.example.parking.repository.WaitingQueueRepository;
import com.example.parking.repository.UserRepository;
import com.example.parking.repository.ParkingConfigRepository;
import com.example.parking.service.BookingService;
import com.example.parking.service.ParkingSlotService;
import com.example.parking.repository.BookingRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ParkingSlotService slotService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WaitingQueueRepository waitingQueueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingConfigRepository configRepository;

    @PostMapping("/slot")
    public ParkingSlot addSlot(@RequestParam String slotNumber,
                               @RequestParam(defaultValue = "1") int floor) {
        return slotService.addSlot(slotNumber, floor);
    }

    @GetMapping("/slots")
    public List<ParkingSlot> getSlots() {
        return slotService.getAllSlots();
    }

    @DeleteMapping("/slot/{id}")
    public String deleteSlot(@PathVariable Long id) {
        return slotService.deleteSlot(id);
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // 🚦 View waiting queue
    @GetMapping("/queue")
    public List<WaitingQueue> getQueue() {
        return waitingQueueRepository.findAllByOrderByRequestTimeAsc();
    }

    // 🛡️ Force release a booking
    @PostMapping("/force-release/{bookingId}")
    public ResponseEntity<?> forceRelease(@PathVariable Long bookingId) {
        try {
            return ResponseEntity.ok(bookingService.forceRelease(bookingId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    // ⚙️ Get config
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        double rate = configRepository.findById("hourly_rate")
                .map(c -> Double.parseDouble(c.getValue())).orElse(20.0);
        return ResponseEntity.ok(java.util.Map.of("hourlyRate", rate));
    }

    // ⚙️ Update hourly rate
    @PutMapping("/config/rate")
    public ResponseEntity<?> updateRate(@RequestBody java.util.Map<String, Double> body) {
        double rate = body.getOrDefault("hourlyRate", 20.0);
        if (rate <= 0) return ResponseEntity.badRequest().body("Rate must be greater than 0.");
        ParkingConfig config = configRepository.findById("hourly_rate")
                .orElse(new ParkingConfig("hourly_rate", "20"));
        config.setValue(String.valueOf(rate));
        configRepository.save(config);
        return ResponseEntity.ok(java.util.Map.of("hourlyRate", rate));
    }
    @GetMapping("/users")
    public List<java.util.Map<String, Object>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(u -> {
            List<Booking> bookings = bookingRepository.findByUserEmail(u.getEmail());
            long active = bookings.stream().filter(Booking::isActive).count();
            java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("totalBookings", bookings.size());
            map.put("activeBookings", active);
            return map;
        }).toList();
    }

    // 📊 Analytics
    @GetMapping("/analytics")
    public java.util.Map<String, Object> getAnalytics() {
        List<Booking> all = bookingRepository.findAll();
        double totalRevenue = all.stream().filter(b -> b.getCost() != null).mapToDouble(Booking::getCost).sum();
        long totalBookings = all.size();
        long activeBookings = all.stream().filter(Booking::isActive).count();
        long completedBookings = all.stream().filter(b -> !b.isActive() && b.getExitTime() != null).count();
        long cancelledBookings = all.stream().filter(b -> !b.isActive() && b.getExitTime() == null).count();

        List<java.util.Map<String, Object>> topSlots = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(Booking::getSlotNumber, java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> { java.util.Map<String, Object> m = new java.util.LinkedHashMap<>(); m.put("slot", e.getKey()); m.put("count", e.getValue()); return m; })
                .toList();

        List<java.util.Map<String, Object>> topUsers = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(Booking::getUserEmail, java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> { java.util.Map<String, Object> m = new java.util.LinkedHashMap<>(); m.put("email", e.getKey()); m.put("count", e.getValue()); return m; })
                .toList();

        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("totalRevenue", totalRevenue);
        result.put("totalBookings", totalBookings);
        result.put("activeBookings", activeBookings);
        result.put("completedBookings", completedBookings);
        result.put("cancelledBookings", cancelledBookings);
        result.put("topSlots", topSlots);
        result.put("topUsers", topUsers);
        return result;
    }
}