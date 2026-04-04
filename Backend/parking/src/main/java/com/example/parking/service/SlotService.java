package com.example.parking.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.parking.model.Slot;
import com.example.parking.repository.SlotRepository;

@Service
public class SlotService {

    @Autowired
    private SlotRepository slotRepository;

    // ➕ Add slot
    public Slot addSlot(String slotNumber) {
        Slot slot = new Slot();
        slot.setSlotNumber(slotNumber);
        slot.setAvailable(true);
        return slotRepository.save(slot);
    }

    // 📋 Get all slots
    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    // ❌ Delete slot
    public void deleteSlot(Long id) {
        slotRepository.deleteById(id);
    }
}