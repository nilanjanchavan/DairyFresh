package com.dairyfresh.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/data")
public class AdminDataController {

    @GetMapping
    public ResponseEntity<?> getAdminData(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("isAdmin") == null || !(Boolean) session.getAttribute("isAdmin")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized: Admin access required"));
        }

        // Return mock data for the minimal admin panel
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", 1430);
        data.put("activeSubscriptions", 420);
        data.put("revenue", "₹85,000");
        data.put("recentOrders", Arrays.asList(
                "Order #8832 - 2x Fresh Milk - Delivered",
                "Order #8833 - 1x Greek Yogurt - Pending",
                "Order #8834 - 1x Premium Butter - Packed"
        ));

        return ResponseEntity.ok(data);
    }
}
