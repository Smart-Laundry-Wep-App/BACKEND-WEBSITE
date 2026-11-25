CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  phone VARCHAR(32) NULL,
  branch VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  avatar VARCHAR(500) NULL,
  fcm_token VARCHAR(512) NULL,
  token_version INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_role (role_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(24) NOT NULL DEFAULT 'kg',
  estimated_hours SMALLINT UNSIGNED NOT NULL DEFAULT 24,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_active_category (is_active, category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promos (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(48) NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_transaction DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  valid_until DATE NULL,
  claim_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NULL,
  service_id VARCHAR(36) NULL,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  unit VARCHAR(24) NOT NULL DEFAULT 'kg',
  weight DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Antrean',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'Belum Bayar',
  payment_method VARCHAR(48) NOT NULL DEFAULT 'Tunai',
  notes TEXT NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  estimated_completion DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  INDEX idx_orders_customer (customer_id, created_at),
  INDEX idx_orders_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  customer VARCHAR(120) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(48) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Belum Bayar',
  paid_at DATETIME NULL,
  reference_number VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY uq_payments_order (order_id),
  INDEX idx_payments_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  payment_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(48) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY uq_transactions_payment (payment_id),
  INDEX idx_transactions_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NULL,
  user_id VARCHAR(36) NULL,
  recipient VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(32) NOT NULL DEFAULT 'FCM',
  status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Pengiriman',
  fcm_message_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notifications_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_results (
  id VARCHAR(36) PRIMARY KEY,
  requested_by VARCHAR(36) NOT NULL,
  model VARCHAR(100) NOT NULL,
  input_snapshot JSON NOT NULL,
  result JSON NOT NULL,
  review_status ENUM('pending', 'verified', 'needs_revision') NOT NULL DEFAULT 'pending',
  review_note TEXT NULL,
  reviewed_by VARCHAR(36) NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_results_user FOREIGN KEY (requested_by) REFERENCES users(id),
  CONSTRAINT fk_ai_results_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ai_results_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id VARCHAR(36) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity_created (entity, entity_id, created_at)
) ENGINE=InnoDB;
