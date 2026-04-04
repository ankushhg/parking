package com.example.parking.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.parking.model.ParkingSlot;
import com.example.parking.repository.ParkingSlotRepository;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository slotRepository;

    public ParkingSlot addSlot(String slotNumber) {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(slotNumber);
        slot.setAvailable(true);
        return slotRepository.save(slot);
    }

    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    public String deleteSlot(Long id) {
        Optional<ParkingSlot> slot = slotRepository.findById(id);
        if (slot.isPresent()) {
            slotRepository.deleteById(id);
            return "Slot deleted successfully!";
        }
        return "Slot not found!";
    }
}
