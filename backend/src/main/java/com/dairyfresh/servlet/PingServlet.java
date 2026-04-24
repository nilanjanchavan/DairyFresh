package com.dairyfresh.servlet;

import com.dairyfresh.config.DatabaseConfig;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/ping")
public class PingServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        Map<String, String> responseData = new HashMap<>();
        responseData.put("message", "pong");
        responseData.put("status", "success");

        // Test DB connectivity
        try (Connection conn = DatabaseConfig.getConnection()) {
            responseData.put("database", "connected");
            responseData.put("db_url", System.getenv("DB_URL") != null ? System.getenv("DB_URL") : "default");
            responseData.put("db_user", System.getenv("DB_USER") != null ? System.getenv("DB_USER") : "default");
        } catch (Exception e) {
            responseData.put("database", "error");
            responseData.put("db_error", e.getMessage());
            responseData.put("db_url", System.getenv("DB_URL") != null ? System.getenv("DB_URL") : "default");
            responseData.put("db_user", System.getenv("DB_USER") != null ? System.getenv("DB_USER") : "default");
        }

        PrintWriter out = resp.getWriter();
        out.print(gson.toJson(responseData));
        out.flush();
    }
}
