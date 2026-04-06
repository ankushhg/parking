package com.example.parking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.parking.model.Booking;
import com.example.parking.service.BookingService;
import com.example.parking.config.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private JwtUtil jwtUtil;

    // 🔐 COMMON METHOD (avoid repeating code)
    private String getEmailFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token missing or invalid");
        }

        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    // 🤖 AUTO BOOK — smart slot allocation
    @PostMapping("/auto-book")
    public ResponseEntity<?> autoBook(HttpServletRequest request) {
        try {
            String email = getEmailFromRequest(request);
            Booking booking = bookingService.autoBookSlot(email);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    // 🚗 BOOK SLOT
    @PostMapping("/book")
    public ResponseEntity<?> bookSlot(@RequestParam String slotNumber,
                                      @RequestParam(required = false) String vehicleNumber,
                                      HttpServletRequest request) {
        try {
            String email = getEmailFromRequest(request);
            Booking booking = bookingService.bookSlot(email, slotNumber, vehicleNumber);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    // ❌ CANCEL BOOKING
    @DeleteMapping("/cancel/{id}")
    public String cancelBooking(@PathVariable Long id,
                                HttpServletRequest request) {

        String email = getEmailFromRequest(request);
        return bookingService.cancelBooking(id, email);
    }

    // 🔓 RELEASE SLOT
    @PutMapping("/release/{bookingId}")
    public Booking release(@PathVariable Long bookingId) {
        return bookingService.releaseSlot(bookingId);
    }

    // 📜 BOOKING HISTORY BY USER ID
    @GetMapping("/history/{userId}")
    public List<Booking> history(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }

    // 📋 MY BOOKINGS
    @GetMapping("/my-bookings")
    public List<Booking> myBookings(HttpServletRequest request) {
        String email = getEmailFromRequest(request);
        return bookingService.myBookings(email);
    }

    // 🚦 QUEUE POSITION
    @GetMapping("/queue-position")
    public ResponseEntity<?> queuePosition(HttpServletRequest request) {
        String email = getEmailFromRequest(request);
        int position = bookingService.getQueuePosition(email);
        if (position == -1) return ResponseEntity.ok(java.util.Map.of("inQueue", false));
        return ResponseEntity.ok(java.util.Map.of("inQueue", true, "position", position));
    }

    // 🚪 LEAVE QUEUE
    @DeleteMapping("/leave-queue")
    public ResponseEntity<?> leaveQueue(HttpServletRequest request) {
        try {
            String email = getEmailFromRequest(request);
            return ResponseEntity.ok(bookingService.leaveQueue(email));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}