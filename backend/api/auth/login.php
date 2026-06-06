<?php
// ============================================================
// Auth: Login
// POST /api/auth/login.php
// Body: { email, password }
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/jwt.php';

setCORSHeaders();
handlePreflight();
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$body = getRequestBody();
$email    = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';

if (!$email || !$password) {
    jsonError('Email and password are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError('Invalid email format');
}

$db = getDB();

$stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonError('Invalid email or password', 401);
}

// Update last login
$db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

// Store in session
$sessionUser = [
    'id'    => $user['id'],
    'name'  => $user['name'],
    'email' => $user['email'],
    'role'  => $user['role'],
    'phone' => $user['phone'],
];
$_SESSION['user'] = $sessionUser;

logAction($db, $user['id'], 'user_login', 'users', $user['id'], 'User logged in successfully');

$token = jwt_encode(['id' => (int)$user['id'], 'email' => $user['email'], 'role' => $user['role']]);
$sessionUser['token'] = $token;

jsonSuccess($sessionUser, 'Login successful');
