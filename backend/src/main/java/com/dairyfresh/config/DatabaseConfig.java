package com.dairyfresh.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 2000;

    public static Connection getConnection() throws SQLException, ClassNotFoundException {
        String dbUrl = System.getenv("DB_URL") != null ? System.getenv("DB_URL") : "jdbc:mysql://localhost:3306/dairyfresh_db?useSSL=false&allowPublicKeyRetrieval=true";
        String dbUser = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : "root";
        String dbPassword = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "root";

        // Explicitly load the driver (good practice in web apps)
        Class.forName("com.mysql.cj.jdbc.Driver");

        SQLException lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
            } catch (SQLException e) {
                lastException = e;
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw e;
                    }
                }
            }
        }
        throw lastException;
    }
}
