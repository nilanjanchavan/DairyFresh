package com.dairyfresh.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PushNotificationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void sendNotificationToUser(String targetEmail, String title, String body) {
        if (targetEmail == null || targetEmail.isEmpty()) {
            return;
        }

        try {
            List<String> tokens = jdbcTemplate.queryForList(
                    "SELECT fcm_token FROM user_devices WHERE user_email = ?",
                    String.class, targetEmail);

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
                } catch (Exception e) {
                    System.err.println("Failed to send push notification to token " + token + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Database error fetching FCM tokens: " + e.getMessage());
        }
    }

    public void sendNotificationToRole(String role, String title, String body) {
        try {
            // Find all users with the specified role and get their tokens
            List<String> tokens = jdbcTemplate.queryForList(
                    "SELECT d.fcm_token FROM user_devices d JOIN users u ON d.user_email = u.email WHERE u.role = ?",
                    String.class, role);

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
                } catch (Exception e) {
                    System.err.println("Failed to send push notification to admin token " + token + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Database error fetching admin FCM tokens: " + e.getMessage());
        }
    }
}
