package com.example.parking.controller;

import com.example.parking.dto.*;
import com.example.parking.enums.VehicleType;
import com.example.parking.enums.Zone;
import com.example.parking.repository.UserRepository;
import com.example.parking.service.ParkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final ParkingService parkingService;
    private final UserRepository userRepository;

    @PostMapping("/checkin")
    public ResponseEntity<SessionResponse> checkIn(@AuthenticationPrincipal UserDetails userDetails,
                                                    @RequestBody CheckInRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(parkingService.checkIn(userId, request));
    }

    @PostMapping("/checkout/{sessionId}")
    public ResponseEntity<SessionResponse> checkOut(@AuthenticationPrincipal UserDetails userDetails,
                                                     @PathVariable Long sessionId) {
        return ResponseEntity.ok(parkingService.checkOut(sessionId, userDetails.getUsername()));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> mySessions(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(parkingService.getUserSessions(userId));
    }

    @GetMapping("/slots/available")
    public ResponseEntity<List<SlotResponse>> availableSlots(
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) Zone zone) {
        return ResponseEntity.ok(parkingService.getAvailableSlots(vehicleType, zone));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<SlotResponse>> allSlots() {
        return ResponseEntity.ok(parkingService.getAllSlots());
    }

    @GetMapping("/session/vehicle/{vehicleNumber}")
    public ResponseEntity<SessionResponse> sessionByVehicle(@PathVariable String vehicleNumber) {
        return ResponseEntity.ok(parkingService.getActiveSessionByVehicle(vehicleNumber));
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
    }
}
