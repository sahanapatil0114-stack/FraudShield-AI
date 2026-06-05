<?php
// ============================================================
// Notifications API
// GET  /api/notifications/index.php         - get user notifications
// POST /api/notifications/index.php?mark=1  - mark all as read
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

$user   = requireAuth();
$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->prepare("
        SELECT n.*, t.transaction_ref, t.amount, t.merchant
        FROM notifications n
        LEFT JOIN transactions t ON n.transaction_id = t.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 50
    ");
    $stmt->execute([$user['id']]);
    $notifs = $stmt->fetchAll();

    $unreadStmt = $db->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $unreadStmt->execute([$user['id']]);
    $unreadCount = $unreadStmt->fetchColumn();

    jsonSuccess(['notifications' => $notifs, 'unread_count' => (int)$unreadCount]);
}

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    if ($action === 'mark_read') {
        $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?")->execute([$user['id']]);
        jsonSuccess(null, 'All notifications marked as read');
    }
    jsonError('Unknown action');
}

jsonError('Method not allowed', 405);
