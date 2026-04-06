package com.example.parking.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.parking.config.JwtUtil;
import com.example.parking.dto.LoginRequest;
import com.example.parking.dto.RegisterRequest;
import com.example.parking.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            String role = jwtUtil.extractRole(token);
            return ResponseEntity.ok(Map.of("token", token, "role", role));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Step 1: User submits email → get reset token
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String token = authService.forgotPassword(body.get("email"));
            return ResponseEntity.ok(Map.of(
                "message", "Reset token generated.",
                "resetToken", token  // In production, send via email instead
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Step 2: User submits token + new password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String result = authService.resetPassword(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // Change password for logged-in user
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            String result = authService.changePassword(email, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // Update name for logged-in user
    @PutMapping("/update-name")
    public ResponseEntity<?> updateName(@RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            String newToken = authService.updateName(email, body.get("name"));
            return ResponseEntity.ok(Map.of("token", newToken));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
