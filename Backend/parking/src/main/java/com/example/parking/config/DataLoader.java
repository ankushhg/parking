package com.example.parking.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.parking.model.ParkingSlot;
import com.example.parking.model.User;
import com.example.parking.repository.ParkingSlotRepository;
import com.example.parking.repository.UserRepository;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ParkingSlotRepository slotRepository,
                               UserRepository userRepository,
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
        };
    }
}
