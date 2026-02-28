-- =============================================
-- EventFlow — Database Setup SQL
-- Run this file against your MySQL server:
--   mysql -u root -p < database_setup.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS eventflow;
USE eventflow;

-- ─────────────── Users Table ───────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('user', 'organizer', 'admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────── Events Table ───────────────
CREATE TABLE IF NOT EXISTS events (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id     INT            NOT NULL,
  title            VARCHAR(255)   NOT NULL,
  description      TEXT,
  category         VARCHAR(100),
  location         VARCHAR(255),
  event_date       DATETIME       NOT NULL,
  total_seats      INT            NOT NULL,
  available_seats  INT            NOT NULL,
  base_price       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  current_price    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  status           ENUM('draft','published','cancelled','completed') NOT NULL DEFAULT 'published',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────── Bookings Table ───────────────
CREATE TABLE IF NOT EXISTS bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT            NOT NULL,
  event_id       INT            NOT NULL,
  seats_booked   INT            NOT NULL,
  amount_paid    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  status         ENUM('pending','confirmed','cancelled','expired') NOT NULL DEFAULT 'pending',
  qr_code        TEXT           NULL,
  expires_at     TIMESTAMP      NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────── Waitlist Table ───────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT       NOT NULL,
  event_id         INT       NOT NULL,
  position         INT       NOT NULL,
  hold_expires_at  TIMESTAMP NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_event (user_id, event_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
