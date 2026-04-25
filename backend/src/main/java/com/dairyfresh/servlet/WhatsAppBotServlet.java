package com.dairyfresh.servlet;

import com.dairyfresh.config.DatabaseConfig;
import com.twilio.twiml.MessagingResponse;
import com.twilio.twiml.messaging.Message;
import com.twilio.twiml.messaging.Body;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

@WebServlet(urlPatterns = {"/api/whatsapp/webhook"})
public class WhatsAppBotServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String from = req.getParameter("From");
        String body = req.getParameter("Body");
        String profileName = req.getParameter("ProfileName");

        if (from == null || body == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
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

        // Log the message in the database asynchronously or just synchronously
        try (Connection conn = DatabaseConfig.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO whatsapp_conversations (phone_number, customer_name, last_message, is_incoming) VALUES (?, ?, ?, ?)");
            stmt.setString(1, from);
            stmt.setString(2, profileName);
            stmt.setString(3, body);
            stmt.setBoolean(4, true);
            stmt.executeUpdate();

            // Log outbound as well
            PreparedStatement stmt2 = conn.prepareStatement("INSERT INTO whatsapp_conversations (phone_number, customer_name, last_message, is_incoming) VALUES (?, ?, ?, ?)");
            stmt2.setString(1, from);
            stmt2.setString(2, profileName);
            stmt2.setString(3, replyText);
            stmt2.setBoolean(4, false);
            stmt2.executeUpdate();
        } catch (Exception e) {
            System.err.println("Database error saving whatsapp message: " + e.getMessage());
        }

        // Return TwiML response
        Body responseBody = new Body.Builder(replyText).build();
        Message sms = new Message.Builder().body(responseBody).build();
        MessagingResponse twiml = new MessagingResponse.Builder().message(sms).build();

        resp.setContentType("application/xml");
        resp.getWriter().print(twiml.toXml());
    }
}
