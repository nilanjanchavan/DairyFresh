package com.dairyfresh.servlet;

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

@WebServlet(urlPatterns = {"/api/login", "/api/logout"})
public class AuthServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        if ("/api/login".equals(path)) {
            handleLogin(req, resp);
        } else if ("/api/logout".equals(path)) {
            handleLogout(req, resp);
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

        String email = jsonRequest.get("email").getAsString();
        String password = jsonRequest.get("password").getAsString();

        // Simple hardcoded admin check for minimal auth
        if ("admin@dairyfresh.com".equals(email) && "admin123".equals(password)) {
            HttpSession session = req.getSession(true);
            session.setAttribute("isAdmin", true);
            session.setAttribute("userEmail", email);

            JsonObject success = new JsonObject();
            success.addProperty("status", "success");
            success.addProperty("role", "admin");
            resp.getWriter().write(gson.toJson(success));
        } else {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Invalid credentials\"}");
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        resp.getWriter().write("{\"status\": \"success\"}");
    }
}
