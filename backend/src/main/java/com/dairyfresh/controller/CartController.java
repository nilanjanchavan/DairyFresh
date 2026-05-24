package com.dairyfresh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getCart(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        String userEmail = (String) session.getAttribute("userEmail");

        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT product_title, product_price, product_image, product_image_dark, product_description, quantity FROM cart_items WHERE user_email = ?",
                    userEmail);

            List<Map<String, Object>> items = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                Map<String, Object> item = new HashMap<>();
                item.put("title", row.get("product_title"));
                item.put("price", row.get("product_price"));
                item.put("imageSrc", row.get("product_image"));
                item.put("imageDarkSrc", row.get("product_image_dark"));
                item.put("description", row.get("product_description"));
                item.put("quantity", row.get("quantity"));
                items.add(item);
            }

            return ResponseEntity.ok(Map.of("status", "success", "items", items));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage().replace("\"", "'")));
        }
    }

    @PostMapping
    public ResponseEntity<?> updateCart(@RequestBody Map<String, List<Map<String, Object>>> body, HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        String userEmail = (String) session.getAttribute("userEmail");

        if (!body.containsKey("items")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing items array"));
        }

        List<Map<String, Object>> items = body.get("items");

        try {
            // Clear existing cart
            jdbcTemplate.update("DELETE FROM cart_items WHERE user_email = ?", userEmail);

            // Insert new items
            if (items != null && !items.isEmpty()) {
                List<Object[]> batchArgs = new ArrayList<>();
                for (Map<String, Object> item : items) {
                    batchArgs.add(new Object[]{
                            userEmail,
                            getStringValue(item, "title"),
                            getStringValue(item, "price"),
                            getStringValue(item, "imageSrc"),
                            getStringValue(item, "imageDarkSrc"),
                            getStringValue(item, "description"),
                            getIntValue(item, "quantity", 1)
                    });
                }
                jdbcTemplate.batchUpdate(
                        "INSERT INTO cart_items (user_email, product_title, product_price, product_image, product_image_dark, product_description, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        batchArgs);
            }

            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Database error: " + e.getMessage().replace("\"", "'")));
        }
    }

    private String getStringValue(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "";
    }

    private int getIntValue(Map<String, Object> map, String key, int defaultVal) {
        Object val = map.get(key);
        if (val instanceof Number) {
            return ((Number) val).intValue();
        }
        return defaultVal;
    }
}
