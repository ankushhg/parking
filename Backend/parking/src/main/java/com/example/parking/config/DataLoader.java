package com.example.parking.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.parking.model.ParkingSlot;
import com.example.parking.model.User;
import com.example.parking.model.ParkingConfig;
import com.example.parking.repository.ParkingSlotRepository;
import com.example.parking.repository.UserRepository;
import com.example.parking.repository.ParkingConfigRepository;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ParkingSlotRepository slotRepository,
                               UserRepository userRepository,
                               ParkingConfigRepository configRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {

            // Seed initial slots only if DB is empty
            if (slotRepository.count() == 0) {
                for (String name : new String[]{"A1", "A2", "A3", "B1", "B2"}) {
                    ParkingSlot s = new ParkingSlot();
                    s.setSlotNumber(name);
                    s.setAvailable(true);
                    slotRepository.save(s);
                }
                System.out.println("✅ Initial slots seeded: A1–A3, B1–B2");
            }

            // Seed admin user
            if (userRepository.findByEmail("admin@parking.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@parking.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("✅ Admin created → admin@parking.com / admin123");
            }

            // Seed default hourly rate
            if (configRepository.findById("hourly_rate").isEmpty()) {
                configRepository.save(new ParkingConfig("hourly_rate", "20"));
                System.out.println("✅ Default hourly rate set: ₹20/hr");
            }
        };
    }
}
