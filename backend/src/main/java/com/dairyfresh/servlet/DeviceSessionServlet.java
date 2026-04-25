package com.dairyfresh.servlet;

import com.dairyfresh.config.DatabaseConfig;
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
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet(urlPatterns = {"/api/device/register", "/api/device/unregister", "/api/device/sessions"})
public class DeviceSessionServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        if ("/api/device/register".equals(path)) {
            BufferedReader reader = req.getReader();
            JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);

            if (jsonRequest == null || !jsonRequest.has("email") || !jsonRequest.has("token") || !jsonRequest.has("fingerprint")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Missing required fields\"}");
                return;
            }

            String email = jsonRequest.get("email").getAsString();
            String token = jsonRequest.get("token").getAsString();
            String fingerprint = jsonRequest.get("fingerprint").getAsString();
            
            String envLimit = System.getenv("MAX_LOGIN_DEVICES");
            int maxDevices = (envLimit != null) ? Integer.parseInt(envLimit) : 3;

            try (Connection conn = DatabaseConfig.getConnection()) {
                // Upsert device
                PreparedStatement checkStmt = conn.prepareStatement("SELECT id FROM user_devices WHERE user_email = ? AND device_fingerprint = ?");
                checkStmt.setString(1, email);
                checkStmt.setString(2, fingerprint);
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    PreparedStatement updateStmt = conn.prepareStatement("UPDATE user_devices SET fcm_token = ?, login_time = CURRENT_TIMESTAMP WHERE id = ?");
                    updateStmt.setString(1, token);
                    updateStmt.setInt(2, rs.getInt("id"));
                    updateStmt.executeUpdate();
                } else {
                    PreparedStatement insertStmt = conn.prepareStatement("INSERT INTO user_devices (user_email, fcm_token, device_fingerprint) VALUES (?, ?, ?)");
                    insertStmt.setString(1, email);
                    insertStmt.setString(2, token);
                    insertStmt.setString(3, fingerprint);
                    insertStmt.executeUpdate();
                }

                // Enforce limits
                PreparedStatement countStmt = conn.prepareStatement("SELECT COUNT(*) FROM user_devices WHERE user_email = ?");
                countStmt.setString(1, email);
                ResultSet countRs = countStmt.executeQuery();
                
                JsonObject responseJson = new JsonObject();
                responseJson.addProperty("status", "success");

                if (countRs.next() && countRs.getInt(1) > maxDevices) {
                    // Evict oldest
                    PreparedStatement evictStmt = conn.prepareStatement(
                        "DELETE FROM user_devices WHERE user_email = ? ORDER BY login_time ASC LIMIT 1"
                    );
                    evictStmt.setString(1, email);
                    evictStmt.executeUpdate();
                    
                    responseJson.addProperty("warning", "Device limit reached. You were logged out from an older device.");
                }

                resp.getWriter().write(gson.toJson(responseJson));
            } catch (Exception e) {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"error\": \"Database error: " + e.getMessage() + "\"}");
            }
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        resp.setContentType("application/json");

        if ("/api/device/unregister".equals(path)) {
            BufferedReader reader = req.getReader();
            JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);

            if (jsonRequest != null && jsonRequest.has("email") && jsonRequest.has("fingerprint")) {
                String email = jsonRequest.get("email").getAsString();
                String fingerprint = jsonRequest.get("fingerprint").getAsString();

                try (Connection conn = DatabaseConfig.getConnection()) {
                    PreparedStatement stmt = conn.prepareStatement("DELETE FROM user_devices WHERE user_email = ? AND device_fingerprint = ?");
                    stmt.setString(1, email);
                    stmt.setString(2, fingerprint);
                    stmt.executeUpdate();
                    resp.getWriter().write("{\"status\": \"success\"}");
                } catch (Exception e) {
                    resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    resp.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
                }
            } else {
                 resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                 resp.getWriter().write("{\"error\": \"Missing email or fingerprint\"}");
            }
        }
    }
}
