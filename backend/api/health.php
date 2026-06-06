<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

setCORSHeaders();
handlePreflight();

try {
    $db = getDB();
    $users = (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $txns  = (int)$db->query('SELECT COUNT(*) FROM transactions')->fetchColumn();
    jsonSuccess([
        'status' => 'online',
        'database' => 'connected',
        'users' => $users,
        'transactions' => $txns,
    ]);
} catch (Exception $e) {
    jsonError('Database error: ' . $e->getMessage(), 500);
}
