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
    private com.dairyfresh.service.PushNotificationService pushNotificationService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, String> request) {
        if (!request.containsKey("title") || !request.containsKey("body")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing title or body"));
        }

        String title = request.get("title");
        String body = request.get("body");
        String targetEmail = request.get("email");

        try {
            if (targetEmail != null && !targetEmail.isEmpty()) {
                pushNotificationService.sendNotificationToUser(targetEmail, title, body);
            } else {
                // Not ideal, but existing behavior sent to everyone if no email
                List<String> tokens = jdbcTemplate.queryForList("SELECT fcm_token FROM user_devices", String.class);
                for (String token : tokens) {
                    try {
                        com.google.firebase.messaging.Message message = com.google.firebase.messaging.Message.builder()
                            .setToken(token)
                            .setNotification(com.google.firebase.messaging.Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                            .build();
                        com.google.firebase.messaging.FirebaseMessaging.getInstance().send(message);
                    } catch (Exception e) {}
                }
            }

            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage()));
        }
    }
}
