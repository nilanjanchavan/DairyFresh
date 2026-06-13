package com.dairyfresh.controller;

import com.dairyfresh.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.dairyfresh.service.PushNotificationService pushNotificationService;

    private boolean isUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return session != null && session.getAttribute("userEmail") != null;
    }

    private boolean isAdmin(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return session != null && session.getAttribute("isAdmin") != null && (Boolean) session.getAttribute("isAdmin");
    }

    @PostMapping("/orders/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> request, HttpServletRequest req) {
        if (!isUser(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login to place an order"));
        }

        HttpSession session = req.getSession(false);
        String email = (String) session.getAttribute("userEmail");
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
        
        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        try {
            // Calculate total amount
            double totalAmount = 0;
            for (Map<String, Object> item : items) {
                String priceStr = (String) item.get("price");
                double price = Double.parseDouble(priceStr.replace("₹", "").split("/")[0]);
                int quantity = (Integer) item.get("quantity");
                totalAmount += (price * quantity);
            }

            // Create order
            KeyHolder keyHolder = new GeneratedKeyHolder();
            final double finalAmount = totalAmount;
            
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO orders (user_email, total_amount, status) VALUES (?, ?, 'PENDING')",
                    Statement.RETURN_GENERATED_KEYS
                );
                ps.setString(1, email);
                ps.setDouble(2, finalAmount);
                return ps;
            }, keyHolder);

            int orderId = keyHolder.getKey().intValue();

            // Insert order items
            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Thank you for your order from DairyFresh!\n\nOrder #").append(orderId).append("\n\nItems:\n");

            for (Map<String, Object> item : items) {
                String title = (String) item.get("title");
                String priceStr = (String) item.get("price");
                int quantity = (Integer) item.get("quantity");
                
                jdbcTemplate.update(
                    "INSERT INTO order_items (order_id, product_title, product_price, quantity) VALUES (?, ?, ?, ?)",
                    orderId, title, priceStr, quantity
                );
                
                emailBody.append("- ").append(title).append(" x").append(quantity).append(" (").append(priceStr).append(")\n");
            }
            
            emailBody.append("\nTotal Amount: ₹").append(totalAmount);
            emailBody.append("\n\nYour order is currently PENDING. We will notify you when it is completed.");

            // Clear the user's cart
            jdbcTemplate.update("DELETE FROM cart_items WHERE user_email = ?", email);

            // Send confirmation email
            emailService.sendEmail(email, "DairyFresh Order Confirmation #" + orderId, emailBody.toString());

            // Send push notification to user
            pushNotificationService.sendNotificationToUser(email, 
                "Order Placed Successfully", 
                "Your order #" + orderId + " for ₹" + totalAmount + " is confirmed and PENDING.");

            // Send push notification to all admins
            pushNotificationService.sendNotificationToRole("admin", 
                "New Order Received", 
                "Order #" + orderId + " placed by " + email + " for ₹" + totalAmount);

            return ResponseEntity.ok(Map.of("status", "success", "message", "Order placed successfully", "orderId", orderId));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to place order: " + e.getMessage()));
        }
    }

    @GetMapping("/orders/history")
    public ResponseEntity<?> getOrderHistory(HttpServletRequest req) {
        if (!isUser(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        HttpSession session = req.getSession(false);
        String email = (String) session.getAttribute("userEmail");

        try {
            List<Map<String, Object>> orders = jdbcTemplate.queryForList(
                "SELECT id, total_amount, status, created_at FROM orders WHERE user_email = ? ORDER BY created_at DESC", 
                email
            );
            
            for (Map<String, Object> order : orders) {
                int orderId = (Integer) order.get("id");
                List<Map<String, Object>> items = jdbcTemplate.queryForList(
                    "SELECT product_title, product_price, quantity FROM order_items WHERE order_id = ?",
                    orderId
                );
                order.put("items", items);
            }
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders"));
        }
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrdersAdmin(HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            List<Map<String, Object>> orders = jdbcTemplate.queryForList(
                "SELECT o.id, o.user_email, o.total_amount, o.status, o.created_at, u.name as user_name, u.phone " +
                "FROM orders o JOIN users u ON o.user_email = u.email ORDER BY o.created_at DESC"
            );
            
            for (Map<String, Object> order : orders) {
                int orderId = (Integer) order.get("id");
                List<Map<String, Object>> items = jdbcTemplate.queryForList(
                    "SELECT product_title, product_price, quantity FROM order_items WHERE order_id = ?",
                    orderId
                );
                order.put("items", items);
            }
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders"));
        }
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable("id") int id, @RequestBody Map<String, String> request, HttpServletRequest req) {
        if (!isAdmin(req)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        try {
            // Get user email to send notification
            List<Map<String, Object>> orderInfo = jdbcTemplate.queryForList("SELECT user_email FROM orders WHERE id = ?", id);
            
            jdbcTemplate.update("UPDATE orders SET status = ? WHERE id = ?", newStatus, id);
            
            if (!orderInfo.isEmpty()) {
                String email = (String) orderInfo.get(0).get("user_email");
                String subject = "DairyFresh Order #" + id + " Status Update";
                String body = "Your order #" + id + " status has been updated to: " + newStatus;
                
                emailService.sendEmail(email, subject, body);
                
                pushNotificationService.sendNotificationToUser(email,
                    "Order Update",
                    "Your order #" + id + " is now " + newStatus);
            }

            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update order status"));
        }
    }
}
