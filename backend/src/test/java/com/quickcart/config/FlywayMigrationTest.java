package com.quickcart.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class FlywayMigrationTest {

    private static final String JDBC_URL = "jdbc:h2:mem:quickcart_flyway_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE";
    private static final String USER = "sa";
    private static final String PASSWORD = "";

    @Test
    @DisplayName("Flyway V1 migration executes cleanly and provisions all foundational quick-commerce tables")
    void testFlywaySchemaMigration() throws Exception {
        // 1. Run Flyway against ephemeral in-memory PostgreSQL-compatible database
        Flyway flyway = Flyway.configure()
                .dataSource(JDBC_URL, USER, PASSWORD)
                .locations("classpath:db/migration")
                .cleanDisabled(false)
                .load();

        flyway.clean();
        MigrateResult result = flyway.migrate();

        assertTrue(result.success, "Flyway migration should complete successfully");
        assertTrue(result.migrationsExecuted >= 1, "At least one migration script should execute");

        // 2. Validate that core tables exist in the schema
        Set<String> tableNames = new HashSet<>();
        try (Connection conn = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")) {

            while (rs.next()) {
                tableNames.add(rs.getString("table_name").toLowerCase());
            }
        }

        assertTrue(tableNames.contains("users"), "Schema should contain 'users' table");
        assertTrue(tableNames.contains("roles"), "Schema should contain 'roles' table");
        assertTrue(tableNames.contains("products"), "Schema should contain 'products' table");
        assertTrue(tableNames.contains("categories"), "Schema should contain 'categories' table");
        assertTrue(tableNames.contains("orders"), "Schema should contain 'orders' table");
        assertTrue(tableNames.contains("order_items"), "Schema should contain 'order_items' table");
        assertTrue(tableNames.contains("payments"), "Schema should contain 'payments' table");
        assertTrue(tableNames.contains("delivery_partners"), "Schema should contain 'delivery_partners' table");
        assertTrue(tableNames.contains("delivery_assignments"), "Schema should contain 'delivery_assignments' table");
        assertTrue(tableNames.contains("wallets"), "Schema should contain 'wallets' table");
        assertTrue(tableNames.contains("wallet_transactions"), "Schema should contain 'wallet_transactions' table");
        assertTrue(tableNames.contains("audit_logs"), "Schema should contain 'audit_logs' table");
        assertTrue(tableNames.contains("idempotency_keys"), "Schema should contain 'idempotency_keys' table");
    }
}
