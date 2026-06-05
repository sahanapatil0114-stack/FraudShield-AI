<?php
// ============================================================
// Analytics API
// GET /api/analytics/index.php
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

$user = requireAuth();
$db   = getDB();

$userId = $user['role'] === 'admin' ? null : (int)$user['id'];
$userFilter = $userId ? "WHERE user_id = $userId" : "";
$txnFilter  = $userId ? "AND user_id = $userId" : "";

// ── Summary stats ──────────────────────────────────────────
$stmt = $db->prepare("
    SELECT
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN status = 'fraud' THEN 1 ELSE 0 END) AS fraud_count,
        SUM(CASE WHEN status = 'safe'  THEN 1 ELSE 0 END) AS safe_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        AVG(fraud_probability) AS avg_fraud_probability,
        SUM(amount) AS total_amount,
        SUM(CASE WHEN status = 'fraud' THEN amount ELSE 0 END) AS fraud_amount
    FROM transactions
    $userFilter
");
$stmt->execute();
$summary = $stmt->fetch();
$summary['total_transactions']    = (int)($summary['total_transactions'] ?? 0);
$summary['fraud_count']           = (int)($summary['fraud_count'] ?? 0);
$summary['safe_count']            = (int)($summary['safe_count'] ?? 0);
$summary['pending_count']         = (int)($summary['pending_count'] ?? 0);
$summary['avg_fraud_probability'] = (float)($summary['avg_fraud_probability'] ?? 0);
$summary['total_amount']          = (float)($summary['total_amount'] ?? 0);
$summary['fraud_amount']          = (float)($summary['fraud_amount'] ?? 0);

// ── Risk level distribution ────────────────────────────────
$stmt = $db->prepare("
    SELECT risk_level, COUNT(*) AS count
    FROM transactions
    $userFilter
    GROUP BY risk_level
");
$stmt->execute();
$riskDist = $stmt->fetchAll();

// ── Daily transaction trend (last 30 days) ─────────────────
$stmt = $db->prepare("
    SELECT 
        DATE(transaction_time) AS date,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'fraud' THEN 1 ELSE 0 END) AS fraud,
        SUM(CASE WHEN status = 'safe'  THEN 1 ELSE 0 END) AS safe
    FROM transactions
    WHERE transaction_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    $txnFilter
    GROUP BY DATE(transaction_time)
    ORDER BY date ASC
");
$stmt->execute();
$dailyTrend = $stmt->fetchAll();

// ── Top merchants by fraud count ───────────────────────────
$stmt = $db->prepare("
    SELECT merchant, COUNT(*) AS fraud_count, SUM(amount) AS total_fraud_amount
    FROM transactions
    WHERE status = 'fraud'
    $txnFilter
    GROUP BY merchant
    ORDER BY fraud_count DESC
    LIMIT 5
");
$stmt->execute();
$topFraudMerchants = $stmt->fetchAll();

// ── Category breakdown ─────────────────────────────────────
$stmt = $db->prepare("
    SELECT category, COUNT(*) AS count,
           SUM(CASE WHEN status = 'fraud' THEN 1 ELSE 0 END) AS fraud_count
    FROM transactions
    $userFilter
    GROUP BY category
    ORDER BY count DESC
");
$stmt->execute();
$categoryBreakdown = $stmt->fetchAll();

// ── System stats (admin only) ──────────────────────────────
$systemStats = null;
if ($user['role'] === 'admin') {
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = 1");
    $activeUsers = $stmt->fetchColumn();
    $stmt = $db->query("SELECT COUNT(*) FROM system_logs WHERE DATE(created_at) = CURDATE()");
    $todayLogs = $stmt->fetchColumn();
    $systemStats = [
        'active_users'  => (int)$activeUsers,
        'today_logs'    => (int)$todayLogs,
    ];
}

jsonSuccess([
    'summary'              => $summary,
    'risk_distribution'    => $riskDist,
    'daily_trend'          => $dailyTrend,
    'top_fraud_merchants'  => $topFraudMerchants,
    'category_breakdown'   => $categoryBreakdown,
    'system'               => $systemStats,
]);
