<?php
// ============================================================
// Auth: Register
// POST /api/auth/register.php
// Body: { name, email, password, phone }
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$body = getRequestBody();
$name     = trim($body['name'] ?? '');
$email    = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';
$phone    = trim($body['phone'] ?? '');

// Validation
if (!$name || !$email || !$password) {
    jsonError('Name, email, and password are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError('Invalid email format');
}

if (strlen($password) < 6) {
    jsonError('Password must be at least 6 characters');
}

$db = getDB();

// Check if email already exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonError('Email address is already registered', 409);
}

// Hash password and insert
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$stmt = $db->prepare("
    INSERT INTO users (name, email, password_hash, phone, role)
    VALUES (?, ?, ?, ?, 'user')
");
$stmt->execute([$name, $email, $hash, $phone]);
$newId = $db->lastInsertId();

logAction($db, $newId, 'user_registered', 'users', $newId, "New user registered: $email");

jsonSuccess([
    'id'    => (int)$newId,
    'name'  => $name,
    'email' => $email,
    'phone' => $phone,
    'role'  => 'user',
], 'Registration successful. Please log in with your email and password.');
