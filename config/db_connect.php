<?php
/**
 * db_connect.php
 * Parking Space Allocation System (PSAS) — Dr. Yanga's Colleges Inc.
 * -----------------------------------------------------------------------
 * PLACEHOLDER ONLY — No active database connection.
 * Replace the blank variables below with real credentials before going live.
 * -----------------------------------------------------------------------
 *
 * Expected "users" table schema:
 *
 * CREATE TABLE users (
 *   id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 *   full_name     VARCHAR(150)  NOT NULL,
 *   id_number     VARCHAR(50)   UNIQUE,              -- school ID (students/faculty)
 *   email         VARCHAR(150)  UNIQUE NOT NULL,
 *   password_hash VARCHAR(255)  NOT NULL,            -- use password_hash() / password_verify()
 *   role          ENUM('admin','faculty','student','visitor','security') NOT NULL DEFAULT 'student',
 *   rfid_tag      VARCHAR(100)  UNIQUE,              -- physical RFID card UID
 *   qr_code       VARCHAR(255)  UNIQUE,              -- generated QR payload
 *   vehicle_plate VARCHAR(20),
 *   vehicle_type  ENUM('car','motorcycle','none') DEFAULT 'none',
 *   license_number VARCHAR(50),
 *   status        ENUM('pending','active','suspended','rejected') DEFAULT 'pending',
 *   created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */

// ── Connection credentials (fill in before deployment) ──────────────────────
$db_host     = '';   // e.g. 'localhost'
$db_user     = '';   // e.g. 'psas_user'
$db_password = '';   // your database password
$db_name     = '';   // e.g. 'psas_db'
$db_port     = 3306; // default MySQL port

// ── PDO connection template (uncomment to activate) ─────────────────────────
/*
try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    // TODO: log error properly — never expose raw messages in production
    error_log('DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    exit('Service temporarily unavailable.');
}
*/

// ── mysqli alternative template (uncomment to activate) ─────────────────────
/*
$conn = new mysqli($db_host, $db_user, $db_password, $db_name, $db_port);
if ($conn->connect_error) {
    error_log('DB connection failed: ' . $conn->connect_error);
    http_response_code(500);
    exit('Service temporarily unavailable.');
}
$conn->set_charset('utf8mb4');
*/

// ── TODO: backend integration checklist ─────────────────────────────────────
// [ ] Fill in credentials above
// [ ] Choose PDO or mysqli and uncomment that block
// [ ] Create a .env file or use environment variables for credentials
// [ ] Wire login.php to query the users table and verify password_hash
// [ ] Wire register.php to INSERT new user with status='pending'
// [ ] Implement RFID/QR lookup via rfid_tag / qr_code columns
// [ ] Add PHP session handling after successful login
// [ ] Implement role-based redirect after login
?>
