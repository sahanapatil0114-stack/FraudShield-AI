<?php
// ============================================================
// Users Management API (Admin only)
// GET    /api/users/index.php        - list users
// PUT    /api/users/index.php        - update user
// DELETE /api/users/index.php?id=X   - delete user
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

$admin  = requireAdmin();
$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: List all users ────────────────────────────────────
if ($method === 'GET') {
    $page   = max(1, (int)($_GET['page']  ?? 1));
    $limit  = min(100, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $searchRaw = trim($_GET['search'] ?? '');
    $search = $searchRaw ? '%' . $searchRaw . '%' : '';

    if ($search) {
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.last_login, u.created_at,
                (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id) AS transaction_count,
                (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id AND t.status = 'fraud') AS fraud_count
            FROM users u
            WHERE u.name LIKE ? OR u.email LIKE ?
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$search, $search, $limit, $offset]);
        $countStmt = $db->prepare("SELECT COUNT(*) FROM users WHERE name LIKE ? OR email LIKE ?");
        $countStmt->execute([$search, $search]);
    } else {
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.last_login, u.created_at,
                (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id) AS transaction_count,
                (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id AND t.status = 'fraud') AS fraud_count
            FROM users u
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $countStmt = $db->query("SELECT COUNT(*) FROM users");
    }
    $users = $stmt->fetchAll();
    $total = (int)$countStmt->fetchColumn();

    jsonSuccess([
        'users'      => $users,
        'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit, 'total_pages' => (int)ceil($total / $limit)]
    ]);
}

// ── PUT: Update user ───────────────────────────────────────
if ($method === 'PUT') {
    $body  = getRequestBody();
    $id    = (int)($body['id'] ?? 0);
    $name  = trim($body['name']      ?? '');
    $role  = trim($body['role']      ?? 'user');
    $phone = trim($body['phone']     ?? '');
    $active = isset($body['is_active']) ? (int)$body['is_active'] : 1;

    if (!$id || !$name) jsonError('User ID and name are required');
    if (!in_array($role, ['admin', 'user'])) jsonError('Invalid role');

    $stmt = $db->prepare("UPDATE users SET name = ?, role = ?, phone = ?, is_active = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$name, $role, $phone, $active, $id]);

    logAction($db, $admin['id'], 'user_updated', 'users', $id, "Admin updated user #$id");
    jsonSuccess(null, 'User updated successfully');
}

// ── DELETE: Delete user ────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('User ID required');
    if ($id === $admin['id']) jsonError('Cannot delete your own account');

    $db->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
    logAction($db, $admin['id'], 'user_deleted', 'users', $id, "Admin deleted user #$id", 'warning');
    jsonSuccess(null, 'User deleted successfully');
}

jsonError('Method not allowed', 405);
