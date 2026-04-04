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

import com.example.parking.model.ParkingSlot;
import com.example.parking.service.ParkingSlotService;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin("*")
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService slotService;

    @PostMapping("/add")
    public ParkingSlot addSlot(@RequestParam String slotNumber) {
        return slotService.addSlot(slotNumber);
    }

    @GetMapping("/all")
    public List<ParkingSlot> getAllSlots() {
        return slotService.getAllSlots();
    }

    @DeleteMapping("/{id}")
    public String deleteSlot(@PathVariable Long id) {
        return slotService.deleteSlot(id);
    }
}
