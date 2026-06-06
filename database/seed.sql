-- ============================================================
-- FraudShield AI - Seed Data
-- Run AFTER schema.sql
-- Default credentials (all seeded users):
--   Admin: admin@fraudshield.ai / password
--   User:  john@example.com     / password
-- ============================================================

USE fraudshield;

-- ============================================================
-- SEED USERS
-- Password: password (bcrypt cost 12)
-- ============================================================
INSERT INTO users (name, email, password_hash, role, phone, is_active) VALUES
('Super Admin', 'admin@fraudshield.ai', '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.', 'admin', '+1-555-0100', 1),
('John Anderson', 'john@example.com', '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.', 'user', '+1-555-0101', 1),
('Sarah Mitchell', 'sarah@example.com', '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.', 'user', '+1-555-0102', 1),
('Mike Thompson', 'mike@example.com', '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.', 'user', '+1-555-0103', 1),
('Emily Chen', 'emily@example.com', '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.', 'user', '+1-555-0104', 1);

-- ============================================================
-- SEED TRANSACTIONS
-- ============================================================
INSERT INTO transactions (user_id, transaction_ref, amount, merchant, location, category, card_last4, transaction_time, status, risk_score, risk_level, fraud_probability) VALUES
-- User 2 (John) - Mix of safe and fraud
(2, 'TXN-20240101-001', 45.99, 'Starbucks Coffee', 'New York, NY', 'food', '4532', '2024-01-15 09:23:00', 'safe', 0.0821, 'low', 0.0821),
(2, 'TXN-20240101-002', 5847.00, 'Unknown Merchant #4821', 'Lagos, Nigeria', 'general', '4532', '2024-01-15 03:14:00', 'fraud', 0.9234, 'high', 0.9234),
(2, 'TXN-20240101-003', 129.99, 'Amazon Prime', 'Seattle, WA', 'shopping', '4532', '2024-01-16 14:05:00', 'safe', 0.0512, 'low', 0.0512),
(2, 'TXN-20240101-004', 2800.00, 'Crypto Exchange XYZ', 'Unknown Location', 'crypto', '4532', '2024-01-17 02:47:00', 'fraud', 0.8791, 'high', 0.8791),
(2, 'TXN-20240101-005', 78.50, 'Shell Gas Station', 'Chicago, IL', 'fuel', '4532', '2024-01-18 11:30:00', 'safe', 0.1023, 'low', 0.1023),
(2, 'TXN-20240101-006', 349.99, 'Best Buy Electronics', 'Los Angeles, CA', 'electronics', '4532', '2024-01-19 16:22:00', 'safe', 0.1543, 'low', 0.1543),
(2, 'TXN-20240101-007', 1200.00, 'Unnamed Store #9911', 'Miami, FL', 'general', '4532', '2024-01-20 23:58:00', 'fraud', 0.7234, 'high', 0.7234),
(2, 'TXN-20240101-008', 23.45, 'McDonald''s', 'Houston, TX', 'food', '4532', '2024-01-21 12:15:00', 'safe', 0.0334, 'low', 0.0334),
(2, 'TXN-20240101-009', 567.00, 'Nike Official Store', 'Dallas, TX', 'shopping', '4532', '2024-01-22 10:45:00', 'safe', 0.0621, 'low', 0.0621),
(2, 'TXN-20240101-010', 3500.00, 'Mystery Vendor 01', 'Unknown', 'general', '4532', '2024-01-23 04:22:00', 'fraud', 0.8912, 'high', 0.8912),

-- User 3 (Sarah) transactions
(3, 'TXN-20240201-001', 92.10, 'Whole Foods Market', 'Boston, MA', 'groceries', '7891', '2024-02-01 08:10:00', 'safe', 0.0412, 'low', 0.0412),
(3, 'TXN-20240201-002', 4200.00, 'Phantom Electronics', 'Moscow, Russia', 'electronics', '7891', '2024-02-02 01:30:00', 'fraud', 0.9112, 'high', 0.9112),
(3, 'TXN-20240201-003', 156.78, 'Costco Wholesale', 'Phoenix, AZ', 'groceries', '7891', '2024-02-03 13:55:00', 'safe', 0.0823, 'low', 0.0823),
(3, 'TXN-20240201-004', 890.00, 'Spa Retreat Center', 'Las Vegas, NV', 'wellness', '7891', '2024-02-04 18:20:00', 'safe', 0.3421, 'medium', 0.3421),
(3, 'TXN-20240201-005', 7200.00, 'Unknown Wire Transfer', 'Offshore', 'transfer', '7891', '2024-02-05 03:45:00', 'fraud', 0.9567, 'high', 0.9567),

-- User 4 (Mike) transactions
(4, 'TXN-20240301-001', 234.56, 'Home Depot', 'Atlanta, GA', 'home', '3214', '2024-03-01 10:00:00', 'safe', 0.0912, 'low', 0.0912),
(4, 'TXN-20240301-002', 1890.00, 'Suspicious Trader XO', 'Unknown IP', 'general', '3214', '2024-03-02 02:15:00', 'fraud', 0.8234, 'high', 0.8234),
(4, 'TXN-20240301-003', 45.00, 'Uber Eats', 'San Francisco, CA', 'food', '3214', '2024-03-03 19:30:00', 'safe', 0.0521, 'low', 0.0521),
(4, 'TXN-20240301-004', 670.00, 'Flight Booking XYZ', 'Online', 'travel', '3214', '2024-03-04 14:45:00', 'safe', 0.2134, 'medium', 0.2134),
(4, 'TXN-20240301-005', 89.99, 'Netflix Premium', 'Online', 'subscription', '3214', '2024-03-05 09:00:00', 'safe', 0.0312, 'low', 0.0312);

-- ============================================================
-- SEED DETECTION HISTORY (linked to transactions)
-- ============================================================
INSERT INTO detection_history (transaction_id, user_id, model_version, fraud_probability, risk_level, processing_time_ms) VALUES
(1, 2, 'v1.0.0', 0.0821, 'low', 142),
(2, 2, 'v1.0.0', 0.9234, 'high', 165),
(3, 2, 'v1.0.0', 0.0512, 'low', 138),
(4, 2, 'v1.0.0', 0.8791, 'high', 171),
(5, 2, 'v1.0.0', 0.1023, 'low', 144),
(6, 2, 'v1.0.0', 0.1543, 'low', 139),
(7, 2, 'v1.0.0', 0.7234, 'high', 158),
(8, 2, 'v1.0.0', 0.0334, 'low', 135),
(9, 2, 'v1.0.0', 0.0621, 'low', 141),
(10, 2, 'v1.0.0', 0.8912, 'high', 169);

-- ============================================================
-- SEED SYSTEM LOGS
-- ============================================================
INSERT INTO system_logs (user_id, action, entity_type, description, ip_address, severity) VALUES
(1, 'user_login', 'users', 'Admin logged in successfully', '192.168.1.1', 'info'),
(2, 'user_login', 'users', 'User John Anderson logged in', '192.168.1.50', 'info'),
(2, 'fraud_detected', 'transactions', 'High-risk transaction flagged: TXN-20240101-002 ($5847)', '192.168.1.50', 'critical'),
(3, 'user_login', 'users', 'User Sarah Mitchell logged in', '192.168.1.75', 'info'),
(3, 'fraud_detected', 'transactions', 'High-risk transaction flagged: TXN-20240201-002 ($4200)', '192.168.1.75', 'critical'),
(1, 'user_created', 'users', 'New user account created by admin', '192.168.1.1', 'info'),
(4, 'transaction_submitted', 'transactions', 'New transaction submitted for analysis', '192.168.1.90', 'info'),
(NULL, 'system_startup', 'system', 'FraudShield AI system initialized', '127.0.0.1', 'info');

-- ============================================================
-- SEED NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, is_read, transaction_id) VALUES
(2, '🚨 Fraud Alert', 'High-risk transaction detected: $5,847 at Unknown Merchant. Please review immediately.', 'fraud_alert', 0, 2),
(2, '⚠️ Suspicious Activity', 'Transaction of $2,800 to Crypto Exchange flagged as high-risk.', 'fraud_alert', 0, 4),
(2, 'ℹ️ System Update', 'FraudShield AI model updated to v1.0.0 with improved accuracy.', 'system', 1, NULL),
(3, '🚨 Fraud Alert', 'High-risk transaction detected: $4,200 from Moscow, Russia.', 'fraud_alert', 0, 12),
(3, '🚨 Critical Alert', 'Transaction of $7,200 (Unknown Wire Transfer) flagged as CRITICAL fraud risk.', 'fraud_alert', 0, 15),
(4, '⚠️ Warning', 'Transaction of $1,890 flagged as high-risk. Verify with your bank.', 'fraud_alert', 0, 17);
