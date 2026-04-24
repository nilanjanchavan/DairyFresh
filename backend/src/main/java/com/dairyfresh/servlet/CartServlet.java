package com.dairyfresh.servlet;

import com.dairyfresh.config.DatabaseConfig;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/cart"})
public class CartServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Not logged in\"}");
            return;
        }

        String userEmail = (String) session.getAttribute("userEmail");

        try (Connection conn = DatabaseConfig.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement(
                "SELECT product_title, product_price, product_image, product_image_dark, product_description, quantity FROM cart_items WHERE user_email = ?"
            );
            stmt.setString(1, userEmail);
            ResultSet rs = stmt.executeQuery();

            JsonArray items = new JsonArray();
            while (rs.next()) {
                JsonObject item = new JsonObject();
                item.addProperty("title", rs.getString("product_title"));
                item.addProperty("price", rs.getString("product_price"));
                item.addProperty("imageSrc", rs.getString("product_image"));
                item.addProperty("imageDarkSrc", rs.getString("product_image_dark"));
                item.addProperty("description", rs.getString("product_description"));
                item.addProperty("quantity", rs.getInt("quantity"));
                items.add(item);
            }

            JsonObject response = new JsonObject();
            response.addProperty("status", "success");
            response.add("items", items);
            resp.getWriter().write(gson.toJson(response));

        } catch (SQLException | ClassNotFoundException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"error\": \"Not logged in\"}");
            return;
        }

        String userEmail = (String) session.getAttribute("userEmail");

        BufferedReader reader = req.getReader();
        JsonObject body = gson.fromJson(reader, JsonObject.class);

        if (body == null || !body.has("items")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing items array\"}");
            return;
        }

        Type listType = new TypeToken<List<Map<String, Object>>>() {}.getType();
        List<Map<String, Object>> items = gson.fromJson(body.get("items"), listType);

        try (Connection conn = DatabaseConfig.getConnection()) {
            // Clear existing cart
            PreparedStatement deleteStmt = conn.prepareStatement("DELETE FROM cart_items WHERE user_email = ?");
            deleteStmt.setString(1, userEmail);
            deleteStmt.executeUpdate();

            // Insert new items
            if (items != null && !items.isEmpty()) {
                PreparedStatement insertStmt = conn.prepareStatement(
                    "INSERT INTO cart_items (user_email, product_title, product_price, product_image, product_image_dark, product_description, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)"
                );
                for (Map<String, Object> item : items) {
                    insertStmt.setString(1, userEmail);
                    insertStmt.setString(2, getStringValue(item, "title"));
                    insertStmt.setString(3, getStringValue(item, "price"));
                    insertStmt.setString(4, getStringValue(item, "imageSrc"));
                    insertStmt.setString(5, getStringValue(item, "imageDarkSrc"));
                    insertStmt.setString(6, getStringValue(item, "description"));
                    insertStmt.setInt(7, getIntValue(item, "quantity", 1));
                    insertStmt.addBatch();
                }
                insertStmt.executeBatch();
            }

            resp.getWriter().write("{\"status\": \"success\"}");

        } catch (SQLException | ClassNotFoundException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Database error: " + e.getMessage().replace("\"", "'") + "\"}");
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
