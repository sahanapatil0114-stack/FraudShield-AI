<?php
// ============================================================
// System Logs API (Admin only)
// GET /api/logs/index.php
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

requireAdmin();
$db = getDB();

$page   = max(1, (int)($_GET['page']  ?? 1));
$limit  = min(200, max(1, (int)($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;
$severity = $_GET['severity'] ?? '';

$params     = [];
$conditions = [];
if ($severity) { $conditions[] = 'l.severity = ?'; $params[] = $severity; }
$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

$stmt = $db->prepare("
    SELECT l.*, u.name AS user_name, u.email AS user_email
    FROM system_logs l
    LEFT JOIN users u ON l.user_id = u.id
    $where
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
");
$params[] = $limit;
$params[] = $offset;
$stmt->execute($params);
$logs = $stmt->fetchAll();

$countParams = $severity ? [$severity] : [];
$cStmt = $db->prepare("SELECT COUNT(*) FROM system_logs $where");
$cStmt->execute($countParams);
$total = $cStmt->fetchColumn();

jsonSuccess([
    'logs'       => $logs,
    'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit]
]);
