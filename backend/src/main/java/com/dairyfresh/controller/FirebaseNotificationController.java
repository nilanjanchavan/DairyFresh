package com.dairyfresh.controller;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications/send")
public class FirebaseNotificationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, String> request) {
        if (!request.containsKey("title") || !request.containsKey("body")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing title or body"));
        }

        String title = request.get("title");
        String body = request.get("body");
        String targetEmail = request.get("email");

        try {
            List<String> tokens;
            if (targetEmail != null && !targetEmail.isEmpty()) {
                tokens = jdbcTemplate.queryForList("SELECT fcm_token FROM user_devices WHERE user_email = ?",
                        String.class, targetEmail);
            } else {
                tokens = jdbcTemplate.queryForList("SELECT fcm_token FROM user_devices", String.class);
            }

            int successCount = 0;
            int failureCount = 0;

            for (String token : tokens) {
                try {
                    Message message = Message.builder()
                        .setToken(token)
                        .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                        .build();
                    FirebaseMessaging.getInstance().send(message);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("Failed to send notification to block " + token + ": " + e.getMessage());
                    failureCount++;
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "sent", successCount,
                    "failed", failureCount
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage()));
        }
    }
}
