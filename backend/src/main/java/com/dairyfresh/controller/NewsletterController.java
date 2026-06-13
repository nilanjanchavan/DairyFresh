package com.dairyfresh.controller;

import com.dairyfresh.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NewsletterController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    private boolean isAdmin(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return session != null && session.getAttribute("isAdmin") != null && (Boolean) session.getAttribute("isAdmin");
    }

    @PostMapping("/newsletter/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            List<Integer> existing = jdbcTemplate.queryForList("SELECT id FROM newsletter_subscribers WHERE email = ?", Integer.class, email.trim());
            if (!existing.isEmpty()) {
                return ResponseEntity.ok(Map.of("status", "success", "message", "Already subscribed"));
            }

            jdbcTemplate.update("INSERT INTO newsletter_subscribers (email) VALUES (?)", email.trim());

            emailService.sendEmail(email.trim(), "Welcome to DairyFresh Newsletter!",
                    "Thank you for subscribing to our newsletter! You'll receive exclusive updates and offers from DairyFresh.");

            return ResponseEntity.ok(Map.of("status", "success", "message", "Subscribed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/newsletter/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody Map<String, String> request, HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String subject = request.get("subject");
        String message = request.get("message");

        if (subject == null || message == null || subject.trim().isEmpty() || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject and message are required"));
        }

        try {
            List<String> subscribers = jdbcTemplate.queryForList("SELECT email FROM newsletter_subscribers", String.class);
            int sentCount = 0;
            for (String email : subscribers) {
                try {
                    emailService.sendEmail(email, subject, message);
                    sentCount++;
                } catch (Exception e) {
                    System.err.println("Failed to send newsletter to " + email);
                }
            }

            return ResponseEntity.ok(Map.of("status", "success", "message", "Broadcast sent to " + sentCount + " subscribers"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send broadcast"));
        }
    }
}
