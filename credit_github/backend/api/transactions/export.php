<?php
// ============================================================
// Export Transactions as CSV
// GET /api/transactions/export.php
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

$user = requireAuth();
$db   = getDB();

$conditions = [];
$params     = [];

if ($user['role'] !== 'admin') {
    $conditions[] = 't.user_id = ?';
    $params[]     = $user['id'];
}

$status = $_GET['status'] ?? '';
$risk   = $_GET['risk']   ?? '';
if ($status) { $conditions[] = 't.status = ?';     $params[] = $status; }
if ($risk)   { $conditions[] = 't.risk_level = ?'; $params[] = $risk;   }

$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

$stmt = $db->prepare("
    SELECT t.transaction_ref, u.name AS user_name, t.amount, t.merchant, t.location,
           t.category, t.status, t.risk_level, t.fraud_probability, t.transaction_time
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    $where
    ORDER BY t.transaction_time DESC
    LIMIT 10000
");
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Output CSV
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="transactions_' . date('Y-m-d') . '.csv"');

$out = fopen('php://output', 'w');
fputcsv($out, ['Reference', 'User', 'Amount', 'Merchant', 'Location', 'Category', 'Status', 'Risk Level', 'Fraud Probability', 'Date']);
foreach ($rows as $row) {
    fputcsv($out, array_values($row));
}
fclose($out);
