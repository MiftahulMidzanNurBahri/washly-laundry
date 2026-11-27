-- Washly Laundry Management System
-- Import this file using phpMyAdmin or the MySQL command line.

CREATE DATABASE IF NOT EXISTS washly_laundry
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE washly_laundry;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS scents (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description VARCHAR(255) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NULL UNIQUE,
  customer_id BIGINT UNSIGNED NOT NULL,
  service_id VARCHAR(40) NOT NULL,
  scent_id VARCHAR(40) NOT NULL,
  service_name_snapshot VARCHAR(120) NOT NULL,
  unit_snapshot VARCHAR(20) NOT NULL,
  price_per_unit_snapshot DECIMAL(12,2) NOT NULL,
  scent_name_snapshot VARCHAR(100) NOT NULL,
  scent_price_snapshot DECIMAL(12,2) NOT NULL DEFAULT 0,
  estimated_weight DECIMAL(8,2) NOT NULL,
  actual_weight DECIMAL(8,2) NULL,
  final_cost DECIMAL(12,2) NULL,
  notes VARCHAR(1000) NOT NULL DEFAULT '',
  handover_method ENUM('antar-sendiri', 'jemput-kurir') NOT NULL DEFAULT 'antar-sendiri',
  status ENUM('Menunggu Penyerahan', 'Diproses', 'Siap Diambil', 'Diambil') NOT NULL DEFAULT 'Menunggu Penyerahan',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orders_service FOREIGN KEY (service_id) REFERENCES services(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orders_scent FOREIGN KEY (scent_id) REFERENCES scents(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_orders_customer_created (customer_id, created_at),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  status ENUM('Menunggu Penyerahan', 'Diproses', 'Siap Diambil', 'Diambil') NOT NULL,
  note VARCHAR(1000) NOT NULL DEFAULT '',
  changed_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_history_order_created (order_id, created_at)
) ENGINE=InnoDB;

-- Initial service catalog: kept in sync with js/config.js.
INSERT INTO services (id, name, unit, price, duration, description, sort_order) VALUES
('cuci-komplit', 'Cuci Komplit (Reguler)', 'kg', 8000, '2 Hari', 'Pencucian higienis mendalam, pengeringan mesin, dan setrika uap rapi.', 1),
('cuci-kering', 'Cuci Kering Lipat', 'kg', 6000, '1 Hari', 'Cuci bersih dan kering wangi tanpa setrika, dilipat rapi siap simpan.', 2),
('setrika', 'Setrika Uap Saja', 'kg', 5000, '1 Hari', 'Penyetrikaan uap presisi untuk pakaian yang sudah dicuci sendiri di rumah.', 3),
('express', 'Express Wash Kilat', 'kg', 14000, '6 Jam', 'Layanan prioritas cepat kilat untuk kebutuhan mendesak.', 4),
('bedcover', 'Bed Cover & Selimut', 'pcs', 25000, '2 Hari', 'Perawatan khusus selimut tebal dan bed cover dengan mesin kapasitas besar.', 5),
('sepatu-tas', 'Deep Clean Sepatu & Tas', 'pasang', 30000, '3 Hari', 'Pembersihan detail khusus bahan sneaker, kulit, kanvas dan suede.', 6)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), unit = VALUES(unit), price = VALUES(price),
  duration = VALUES(duration), description = VALUES(description), sort_order = VALUES(sort_order);

INSERT INTO scents (id, name, price, description) VALUES
('ocean-fresh', 'Ocean Fresh', 0, 'Segar dan sejuk'),
('lavender', 'Lavender Blossom', 2000, 'Aroma relaksasi mewah'),
('sakura', 'Sakura Petals', 2000, 'Wangi lembut bunga sakura'),
('downy-mystique', 'Downy Mystique', 2000, 'Aroma parfum tahan lama'),
('neutral', 'Tanpa Parfum', 0, 'Tanpa tambahan parfum')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), price = VALUES(price), description = VALUES(description);

-- Demo admin account for local testing only.
-- Email: admin@washly.id | Password: admin123
-- Change this password immediately on any public/hosted deployment.
INSERT INTO users (name, email, phone, address, password_hash, role)
VALUES (
  'Siti Aminah (Admin Outlet)',
  'admin@washly.id',
  '081188990011',
  'Washly Outlet Pusat',
  '$2y$12$wSryJvWDeYCI2075Dc7.FujHnMShPrI1u9UrUkf7CfRDsOu6r870q',
  'admin'
)
ON DUPLICATE KEY UPDATE email = VALUES(email);
