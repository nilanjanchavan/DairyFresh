package com.dairyfresh.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/api/admin/data")
public class AdminDataServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("isAdmin") == null || !(Boolean) session.getAttribute("isAdmin")) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Unauthorized: Admin access required\"}");
            return;
        }

        // Return mock data for the minimal admin panel
        JsonObject data = new JsonObject();
        data.addProperty("totalUsers", 1430);
        data.addProperty("activeSubscriptions", 420);
        data.addProperty("revenue", "₹85,000");

        JsonArray recentOrders = new JsonArray();
        recentOrders.add("Order #8832 - 2x Fresh Milk - Delivered");
        recentOrders.add("Order #8833 - 1x Greek Yogurt - Pending");
        recentOrders.add("Order #8834 - 1x Premium Butter - Packed");
        data.add("recentOrders", recentOrders);

        resp.getWriter().write(gson.toJson(data));
    }
}
