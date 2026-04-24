package com.dairyfresh.servlet;

import com.dairyfresh.config.DatabaseConfig;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet(urlPatterns = {"/api/login", "/api/logout", "/api/register", "/api/session"})
public class AuthServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        if ("/api/session".equals(req.getServletPath())) {
            HttpSession session = req.getSession(false);
            if (session != null && session.getAttribute("userEmail") != null) {
                JsonObject user = new JsonObject();
                user.addProperty("email", (String) session.getAttribute("userEmail"));
                String name = (String) session.getAttribute("userName");
                user.addProperty("name", name != null ? name : "Admin");
                Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
                user.addProperty("role", (isAdmin != null && isAdmin) ? "admin" : "user");
                resp.getWriter().write(gson.toJson(user));
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"error\": \"Not logged in\"}");
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        if ("/api/login".equals(path)) {
            handleLogin(req, resp);
        } else if ("/api/logout".equals(path)) {
            handleLogout(req, resp);
        } else if ("/api/register".equals(path)) {
            handleRegister(req, resp);
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        BufferedReader reader = req.getReader();
        JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);

        if (jsonRequest == null || !jsonRequest.has("email") || !jsonRequest.has("password") || !jsonRequest.has("name")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing required fields (name, email, password)\"}");
            return;
        }

        String name = jsonRequest.get("name").getAsString().trim();
        String email = jsonRequest.get("email").getAsString().trim().toLowerCase();
        String phone = jsonRequest.has("phone") ? jsonRequest.get("phone").getAsString().trim() : "";
        String password = jsonRequest.get("password").getAsString();

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Name, email, and password cannot be empty\"}");
            return;
        }

        String passwordHash = hashPassword(password);

        try (Connection conn = DatabaseConfig.getConnection()) {
            // Check if email already exists
            PreparedStatement checkStmt = conn.prepareStatement("SELECT id FROM users WHERE email = ?");
            checkStmt.setString(1, email);
            ResultSet rs = checkStmt.executeQuery();
            if (rs.next()) {
                resp.setStatus(HttpServletResponse.SC_CONFLICT);
                resp.getWriter().write("{\"error\": \"An account with this email already exists\"}");
                return;
            }

            // Insert new user
            PreparedStatement insertStmt = conn.prepareStatement("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)");
            insertStmt.setString(1, name);
            insertStmt.setString(2, email);
            insertStmt.setString(3, phone);
            insertStmt.setString(4, passwordHash);
            insertStmt.executeUpdate();

            JsonObject success = new JsonObject();
            success.addProperty("status", "success");
            success.addProperty("message", "Account created successfully");
            resp.getWriter().write(gson.toJson(success));

        } catch (SQLException | ClassNotFoundException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        BufferedReader reader = req.getReader();
        JsonObject jsonRequest = gson.fromJson(reader, JsonObject.class);

        if (jsonRequest == null || !jsonRequest.has("email") || !jsonRequest.has("password")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing email or password\"}");
            return;
        }

        String email = jsonRequest.get("email").getAsString().trim().toLowerCase();
        String password = jsonRequest.get("password").getAsString();

        // 1. Check admin credentials first
        String envAdminEmail = System.getenv("ADMIN_EMAIL");
        String adminEmail = (envAdminEmail != null && !envAdminEmail.isEmpty()) ? envAdminEmail : "admin@dairyfresh.com";
        String envAdminPassword = System.getenv("ADMIN_PASSWORD");
        String adminPassword = (envAdminPassword != null && !envAdminPassword.isEmpty()) ? envAdminPassword : "admin123";

        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password)) {
            HttpSession session = req.getSession(true);
            session.setAttribute("isAdmin", true);
            session.setAttribute("userEmail", email);

            JsonObject success = new JsonObject();
            success.addProperty("status", "success");
            success.addProperty("role", "admin");
            resp.getWriter().write(gson.toJson(success));
            return;
        }

        // 2. Check database users
        String passwordHash = hashPassword(password);
        try (Connection conn = DatabaseConfig.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?");
            stmt.setString(1, email);
            stmt.setString(2, passwordHash);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                HttpSession session = req.getSession(true);
                session.setAttribute("isAdmin", false);
                session.setAttribute("userEmail", rs.getString("email"));
                session.setAttribute("userName", rs.getString("name"));

                JsonObject success = new JsonObject();
                success.addProperty("status", "success");
                success.addProperty("role", "user");
                success.addProperty("name", rs.getString("name"));
                resp.getWriter().write(gson.toJson(success));
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"error\": \"Invalid credentials\"}");
            }
        } catch (SQLException | ClassNotFoundException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        resp.getWriter().write("{\"status\": \"success\"}");
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
