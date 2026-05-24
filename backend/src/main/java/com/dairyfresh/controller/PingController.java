package com.dairyfresh.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ping")
public class PingController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url:default}")
    private String dbUrl;

    @Value("${spring.datasource.username:default}")
    private String dbUser;

    @GetMapping
    public Map<String, String> ping() {
        Map<String, String> responseData = new HashMap<>();
        responseData.put("message", "pong");
        responseData.put("status", "success");

        try {
            jdbcTemplate.execute("SELECT 1");
            responseData.put("database", "connected");
            responseData.put("db_url", dbUrl);
            responseData.put("db_user", dbUser);
        } catch (Exception e) {
            responseData.put("database", "error");
            responseData.put("db_error", e.getMessage());
            responseData.put("db_url", dbUrl);
            responseData.put("db_user", dbUser);
        }

        return responseData;
    }
}
