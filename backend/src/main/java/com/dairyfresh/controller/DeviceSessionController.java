package com.dairyfresh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/device")
public class DeviceSessionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${MAX_LOGIN_DEVICES:3}")
    private int maxDevices;

    @PostMapping("/register")
    public ResponseEntity<?> registerDevice(@RequestBody Map<String, String> request) {
        if (!request.containsKey("email") || !request.containsKey("token") || !request.containsKey("fingerprint")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }

        String email = request.get("email");
        String token = request.get("token");
        String fingerprint = request.get("fingerprint");

        try {
            // Upsert device
            List<Integer> ids = jdbcTemplate.queryForList(
                    "SELECT id FROM user_devices WHERE user_email = ? AND device_fingerprint = ?",
                    Integer.class, email, fingerprint);

            if (!ids.isEmpty()) {
                jdbcTemplate.update(
                        "UPDATE user_devices SET fcm_token = ?, login_time = CURRENT_TIMESTAMP WHERE id = ?",
                        token, ids.get(0));
            } else {
                jdbcTemplate.update(
                        "INSERT INTO user_devices (user_email, fcm_token, device_fingerprint) VALUES (?, ?, ?)",
                        email, token, fingerprint);
            }

            // Enforce limits
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM user_devices WHERE user_email = ?", Integer.class, email);

            if (count != null && count > maxDevices) {
                jdbcTemplate.update("DELETE FROM user_devices WHERE user_email = ? ORDER BY login_time ASC LIMIT 1", email);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "warning", "Device limit reached. You were logged out from an older device."
                ));
            }

            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/unregister")
    public ResponseEntity<?> unregisterDevice(@RequestBody Map<String, String> request) {
        if (request.containsKey("email") && request.containsKey("fingerprint")) {
            String email = request.get("email");
            String fingerprint = request.get("fingerprint");

            try {
                jdbcTemplate.update("DELETE FROM user_devices WHERE user_email = ? AND device_fingerprint = ?",
                        email, fingerprint);
                return ResponseEntity.ok(Map.of("status", "success"));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", e.getMessage()));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing email or fingerprint"));
        }
    }
}
