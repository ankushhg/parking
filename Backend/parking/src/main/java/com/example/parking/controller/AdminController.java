package com.example.parking.controller;

import com.example.parking.dto.*;
import com.example.parking.entity.*;
import com.example.parking.enums.SlotStatus;
import com.example.parking.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ─── Dashboard ───────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ─── Sessions ────────────────────────────────────────────────────────────
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> allSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    @GetMapping("/sessions/active")
    public ResponseEntity<List<SessionResponse>> activeSessions() {
        return ResponseEntity.ok(adminService.getAllActiveSessions());
    }

    @PostMapping("/sessions/{sessionId}/checkout")
    public ResponseEntity<SessionResponse> adminCheckOut(@PathVariable Long sessionId,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(adminService.adminCheckOut(sessionId, userDetails.getUsername()));
    }

    // ─── Slots ───────────────────────────────────────────────────────────────
    @PostMapping("/slots")
    public ResponseEntity<SlotResponse> addSlot(@RequestBody SlotRequest request) {
        return ResponseEntity.ok(adminService.addSlot(request));
    }

    @PatchMapping("/slots/{slotId}/status")
    public ResponseEntity<SlotResponse> updateSlotStatus(@PathVariable Long slotId,
                                                          @RequestParam SlotStatus status) {
        return ResponseEntity.ok(adminService.updateSlotStatus(slotId, status));
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long slotId) {
        adminService.deleteSlot(slotId);
        return ResponseEntity.noContent().build();
    }

    // ─── Rates ───────────────────────────────────────────────────────────────
    @GetMapping("/rates")
    public ResponseEntity<List<ParkingRate>> getRates() {
        return ResponseEntity.ok(adminService.getAllRates());
    }

    @PutMapping("/rates")
    public ResponseEntity<ParkingRate> updateRate(@RequestBody RateUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateRate(request));
    }

    // ─── Users ───────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/toggle")
    public ResponseEntity<Void> toggleUser(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok().build();
    }

    // ─── Reports ─────────────────────────────────────────────────────────────
    @GetMapping("/reports")
    public ResponseEntity<ReportResponse> report(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(adminService.generateReport(from, to));
    }

    // ─── Audit Logs ──────────────────────────────────────────────────────────
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> auditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }
}
