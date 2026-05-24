package com.example.parking.config;

import com.example.parking.entity.ParkingRate;
import com.example.parking.entity.ParkingSlot;
import com.example.parking.entity.User;
import com.example.parking.enums.*;
import com.example.parking.repository.ParkingRateRepository;
import com.example.parking.repository.ParkingSlotRepository;
import com.example.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ParkingSlotRepository slotRepository;
    private final ParkingRateRepository rateRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initAdmin();
        initRates();
        initSlots();
    }

    private void initAdmin() {
        if (!userRepository.existsByEmail("admin@sringeri.temple")) {
            userRepository.save(User.builder()
                    .name("Temple Admin")
                    .email("admin@sringeri.temple")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .phone("9999999999")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build());
            log.info("Default admin created: admin@sringeri.temple / Admin@1234");
        }
    }

    private void initRates() {
        if (rateRepository.count() == 0) {
            rateRepository.saveAll(List.of(
                ParkingRate.builder().vehicleType(VehicleType.TWO_WHEELER).ratePerHour(BigDecimal.valueOf(10)).build(),
                ParkingRate.builder().vehicleType(VehicleType.FOUR_WHEELER).ratePerHour(BigDecimal.valueOf(20)).build(),
                ParkingRate.builder().vehicleType(VehicleType.HEAVY_VEHICLE).ratePerHour(BigDecimal.valueOf(50)).build()
            ));
            log.info("Default parking rates initialized.");
        }
    }

    private void initSlots() {
        if (slotRepository.count() == 0) {
            List<ParkingSlot> slots = new ArrayList<>();
            // Zone A: 30 slots — Two-wheelers (1-20) + Four-wheelers (21-30)
            for (int i = 1; i <= 20; i++) {
                slots.add(buildSlot("A-" + String.format("%02d", i), Zone.A, VehicleType.TWO_WHEELER));
            }
            for (int i = 21; i <= 30; i++) {
                slots.add(buildSlot("A-" + String.format("%02d", i), Zone.A, VehicleType.FOUR_WHEELER));
            }
            // Zone B: 20 slots — Four-wheelers
            for (int i = 1; i <= 20; i++) {
                slots.add(buildSlot("B-" + String.format("%02d", i), Zone.B, VehicleType.FOUR_WHEELER));
            }
            // Zone C: 10 slots — Heavy vehicles
            for (int i = 1; i <= 10; i++) {
                slots.add(buildSlot("C-" + String.format("%02d", i), Zone.C, VehicleType.HEAVY_VEHICLE));
            }
            // Mark 2 handicap slots in Zone A
            slots.get(0).setHandicapReserved(true);
            slots.get(1).setHandicapReserved(true);
            slotRepository.saveAll(slots);
            log.info("60 parking slots initialized across Zones A, B, C.");
        }
    }

    private ParkingSlot buildSlot(String number, Zone zone, VehicleType type) {
        return ParkingSlot.builder()
                .slotNumber(number)
                .zone(zone)
                .vehicleType(type)
                .status(SlotStatus.AVAILABLE)
                .build();
    }
}
