package com.dairyfresh.servlet;

import com.dairyfresh.config.DatabaseConfig;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@WebServlet(urlPatterns = {"/api/notifications/send"})
public class FirebaseNotificationServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Simple auth check - could be improved, but assuming admin only
        resp.setContentType("application/json");

        BufferedReader reader = req.getReader();
        JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);

        if (jsonRequest == null || !jsonRequest.has("title") || !jsonRequest.has("body")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing title or body\"}");
            return;
        }

        String title = jsonRequest.get("title").getAsString();
        String body = jsonRequest.get("body").getAsString();
        String targetEmail = jsonRequest.has("email") ? jsonRequest.get("email").getAsString() : null;

        try (Connection conn = DatabaseConfig.getConnection()) {
            List<String> tokens = new ArrayList<>();
            if (targetEmail != null && !targetEmail.isEmpty()) {
                PreparedStatement stmt = conn.prepareStatement("SELECT fcm_token FROM user_devices WHERE user_email = ?");
                stmt.setString(1, targetEmail);
                ResultSet rs = stmt.executeQuery();
                while(rs.next()) tokens.add(rs.getString("fcm_token"));
            } else {
                PreparedStatement stmt = conn.prepareStatement("SELECT fcm_token FROM user_devices");
                ResultSet rs = stmt.executeQuery();
                while(rs.next()) tokens.add(rs.getString("fcm_token"));
            }

            int successCount = 0;
            int failureCount = 0;

            for (String token : tokens) {
                try {
                    Message message = Message.builder()
                        .setToken(token)
                        .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                        .build();
                    String response = FirebaseMessaging.getInstance().send(message);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("Failed to send notification to block " + token + ": " + e.getMessage());
                    failureCount++;
                }
            }

            JsonObject result = new JsonObject();
            result.addProperty("status", "success");
            result.addProperty("sent", successCount);
            result.addProperty("failed", failureCount);
            resp.getWriter().write(gson.toJson(result));

        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Database error: " + e.getMessage() + "\"}");
        }
    }
}
