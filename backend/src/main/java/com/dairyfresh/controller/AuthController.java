package com.dairyfresh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.dairyfresh.service.EmailService;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    @Value("${admin.email:admin@dairyfresh.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("userEmail") != null) {
            Map<String, Object> user = new HashMap<>();
            user.put("email", session.getAttribute("userEmail"));
            String name = (String) session.getAttribute("userName");
            user.put("name", name != null ? name : "Admin");
            Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
            user.put("role", (isAdmin != null && isAdmin) ? "admin" : "user");
            return ResponseEntity.ok(user);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @Autowired
    private com.dairyfresh.service.TwilioService twilioService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        if (!request.containsKey("email") || !request.containsKey("password") || !request.containsKey("name")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields (name, email, password)"));
        }

        String name = request.get("name").trim();
        String email = request.get("email").trim().toLowerCase();
        String phone = request.containsKey("phone") ? request.get("phone").trim() : "";
        String password = request.get("password");

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and password cannot be empty"));
        }

        String passwordHash = hashPassword(password);

        try {
            List<Integer> existing = jdbcTemplate.queryForList("SELECT id FROM users WHERE email = ?", Integer.class, email);
            if (!existing.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "An account with this email already exists"));
            }

            jdbcTemplate.update("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
                    name, email, phone, passwordHash);

            emailService.sendEmail(email, "Welcome to DairyFresh!", 
                "Hi " + name + ",\n\nWelcome to DairyFresh! We're excited to have you on board. Start shopping for fresh dairy products today!");

            // Send WhatsApp Welcome Message (if phone exists)
            if (!phone.isEmpty()) {
                try {
                    twilioService.sendWhatsAppMessage(phone, "Hi " + name + "! Welcome to DairyFresh 🐄\n\nThanks for signing up. Let us know if you need any help with your orders!");
                } catch (Exception twilioEx) {
                    System.err.println("Could not send WhatsApp welcome message: " + twilioEx.getMessage());
                    // We catch this so it doesn't fail the registration if they haven't joined the Sandbox
                }
            }

            return ResponseEntity.ok(Map.of("status", "success", "message", "Account created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage().replace("\"", "'")));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest req) {
        if (!request.containsKey("email") || !request.containsKey("password")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing email or password"));
        }

        String email = request.get("email").trim().toLowerCase();
        String password = request.get("password");

        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password)) {
            HttpSession session = req.getSession(true);
            session.setAttribute("isAdmin", true);
            session.setAttribute("userEmail", email);
            return ResponseEntity.ok(Map.of("status", "success", "role", "admin"));
        }

        String passwordHash = hashPassword(password);
        try {
            List<Map<String, Object>> users = jdbcTemplate.queryForList(
                    "SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?", email, passwordHash);

            if (!users.isEmpty()) {
                Map<String, Object> user = users.get(0);
                HttpSession session = req.getSession(true);
                session.setAttribute("isAdmin", false);
                session.setAttribute("userEmail", user.get("email"));
                session.setAttribute("userName", user.get("name"));

                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "role", "user",
                        "name", user.get("name")
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage().replace("\"", "'")));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
