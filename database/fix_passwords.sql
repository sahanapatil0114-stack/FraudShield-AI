-- Run this in InfinityFree phpMyAdmin if login says "Invalid credentials"
-- Sets ALL users password to: password

UPDATE users SET password_hash = '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.';
