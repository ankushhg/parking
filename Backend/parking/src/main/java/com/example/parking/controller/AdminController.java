package com.example.parking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.parking.model.Booking;
import com.example.parking.model.ParkingSlot;
import com.example.parking.model.WaitingQueue;
import com.example.parking.repository.WaitingQueueRepository;
import com.example.parking.service.ParkingSlotService;
import com.example.parking.repository.BookingRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ParkingSlotService slotService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WaitingQueueRepository waitingQueueRepository;

    @PostMapping("/slot")
    public ParkingSlot addSlot(@RequestParam String slotNumber) {
        return slotService.addSlot(slotNumber);
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
}
