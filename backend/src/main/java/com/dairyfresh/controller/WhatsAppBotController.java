package com.dairyfresh.controller;

import com.twilio.twiml.MessagingResponse;
import com.twilio.twiml.messaging.Message;
import com.twilio.twiml.messaging.Body;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp/webhook")
public class WhatsAppBotController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping(produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> handleWebhook(
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(value = "Body", required = false) String body,
            @RequestParam(value = "ProfileName", required = false) String profileName) {

        if (from == null || body == null) {
            return ResponseEntity.badRequest().build();
        }

        String lowerBody = body.trim().toLowerCase();
        String replyText = "Sorry, I didn't understand. Type 'menu' to see options.";

        if (lowerBody.equals("hi") || lowerBody.equals("hello") || lowerBody.equals("menu")) {
            replyText = "Welcome to DairyFresh, " + (profileName != null ? profileName : "friend") + "!\n\n"
                    + "🐄 *Our Menu* 🐄\n"
                    + "1. Fresh Milk - ₹45/L\n"
                    + "2. Greek Yogurt - ₹60/500g\n"
                    + "3. Artisan Cheese - ₹150/250g\n"
                    + "4. Fresh Paneer - ₹90/250g\n\n"
                    + "Type 'order' to check order status, or 'support' for contact info.";
        } else if (lowerBody.startsWith("order")) {
            replyText = "Order tracking is currently in development. Please check back later!";
        } else if (lowerBody.equals("support")) {
            replyText = "For support, please email us at doodhwaala@dairyfresh.com or call 1800-XXXX-XXXX.";
        }

        try {
            jdbcTemplate.update(
                    "INSERT INTO whatsapp_conversations (phone_number, customer_name, last_message, is_incoming) VALUES (?, ?, ?, ?)",
                    from, profileName, body, true);

            jdbcTemplate.update(
                    "INSERT INTO whatsapp_conversations (phone_number, customer_name, last_message, is_incoming) VALUES (?, ?, ?, ?)",
                    from, profileName, replyText, false);
        } catch (Exception e) {
            System.err.println("Database error saving whatsapp message: " + e.getMessage());
        }

        Body responseBody = new Body.Builder(replyText).build();
        Message sms = new Message.Builder().body(responseBody).build();
        MessagingResponse twiml = new MessagingResponse.Builder().message(sms).build();

        return ResponseEntity.ok(twiml.toXml());
    }
}
