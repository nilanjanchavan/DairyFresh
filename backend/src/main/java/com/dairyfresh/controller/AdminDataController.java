package com.dairyfresh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDataController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private boolean isAdmin(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return session != null
                && session.getAttribute("isAdmin") != null
                && (Boolean) session.getAttribute("isAdmin");
    }

    @GetMapping("/data")
    public ResponseEntity<?> getAdminData(HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Admin access required"));
        }

        // Get real user count from DB
        int totalUsers = 0;
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            if (count != null) totalUsers = count;
        } catch (Exception e) {
            // table might not exist yet
        }

        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", totalUsers);
        data.put("activeSubscriptions", 0);
        data.put("revenue", "₹0");
        data.put("recentOrders", Arrays.asList(
                "No orders yet"
        ));

        return ResponseEntity.ok(data);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getRegisteredUsers(HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Admin access required"));
        }

        try {
            List<Map<String, Object>> users = jdbcTemplate.queryForList(
                    "SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC"
            );
            return ResponseEntity.ok(Map.of("users", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch users: " + e.getMessage()));
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@org.springframework.web.bind.annotation.PathVariable("id") int id, HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Admin access required"));
        }

        try {
            jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
            return ResponseEntity.ok(Map.of("status", "success", "message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }
}
