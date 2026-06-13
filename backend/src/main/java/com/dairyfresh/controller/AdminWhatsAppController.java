package com.dairyfresh.controller;

import com.dairyfresh.service.TwilioService;
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
@RequestMapping("/api/admin/whatsapp")
public class AdminWhatsAppController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TwilioService twilioService;

    private boolean isAdmin(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return session != null && session.getAttribute("isAdmin") != null && (Boolean) session.getAttribute("isAdmin");
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getConversations(HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            // Group by phone number and sort by created_at ascending
            List<Map<String, Object>> messages = jdbcTemplate.queryForList(
                    "SELECT id, phone_number, customer_name, last_message, is_incoming, created_at FROM whatsapp_conversations ORDER BY phone_number, created_at ASC"
            );
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch conversations: " + e.getMessage()));
        }
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request, HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String toPhone = request.get("phone");
        String messageText = request.get("message");

        if (toPhone == null || toPhone.trim().isEmpty() || messageText == null || messageText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone and message are required"));
        }

        try {
            // Send via Twilio
            twilioService.sendWhatsAppMessage(toPhone.trim(), messageText.trim());

            // Save to database as outgoing
            jdbcTemplate.update(
                    "INSERT INTO whatsapp_conversations (phone_number, customer_name, last_message, is_incoming) VALUES (?, ?, ?, ?)",
                    toPhone.trim(), "Customer", messageText.trim(), false);

            return ResponseEntity.ok(Map.of("status", "success", "message", "Message sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }
}
