<?php
// ============================================================
// Transactions API
// GET  /api/transactions/index.php        - list transactions
// POST /api/transactions/index.php        - create transaction
// ============================================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

$user   = requireAuth();
$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: List transactions ─────────────────────────────────
if ($method === 'GET') {
    $page    = max(1, (int)($_GET['page']    ?? 1));
    $limit   = min(100, max(1, (int)($_GET['limit'] ?? 20)));
    $offset  = ($page - 1) * $limit;
    $search  = '%' . trim($_GET['search']  ?? '') . '%';
    $status  = $_GET['status']  ?? '';
    $risk    = $_GET['risk']    ?? '';

    $conditions = [];
    $params     = [];

    // Admin sees all; user sees only their own
    if ($user['role'] !== 'admin') {
        $conditions[] = 'user_id = ?';
        $params[]     = $user['id'];
    }
    if ($status) { $conditions[] = 'status = ?';     $params[] = $status; }
    if ($risk)   { $conditions[] = 'risk_level = ?'; $params[] = $risk;   }
    
    // Search in merchant, location, ref
    $conditions[] = '(merchant LIKE ? OR location LIKE ? OR transaction_ref LIKE ?)';
    $params[]     = $search; $params[] = $search; $params[] = $search;

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // Count total
    $countStmt = $db->prepare("SELECT COUNT(*) FROM transactions $where");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // Fetch page
    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare("
        SELECT t.*, u.name AS user_name, u.email AS user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        $where
        ORDER BY t.transaction_time DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $transactions = $stmt->fetchAll();

    jsonSuccess([
        'transactions' => $transactions,
        'pagination'   => [
            'total'        => (int)$total,
            'page'         => $page,
            'limit'        => $limit,
            'total_pages'  => (int)ceil($total / $limit),
        ]
    ]);
}

// ── POST: Create transaction ───────────────────────────────
if ($method === 'POST') {
    $body = getRequestBody();

    $amount      = floatval($body['amount'] ?? 0);
    $merchant    = trim($body['merchant']  ?? '');
    $location    = trim($body['location']  ?? '');
    $category    = trim($body['category']  ?? 'general');
    $cardLast4   = trim($body['card_last4'] ?? '0000');
    $status      = trim($body['status']    ?? 'pending');
    $riskScore   = floatval($body['risk_score'] ?? 0);
    $riskLevel   = trim($body['risk_level'] ?? 'low');
    $fraudProb   = floatval($body['fraud_probability'] ?? 0);

    if (!$merchant || !$location || $amount <= 0) {
        jsonError('Amount, merchant, and location are required');
    }

    $ref = 'TXN-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

    $stmt = $db->prepare("
        INSERT INTO transactions 
            (user_id, transaction_ref, amount, merchant, location, category, card_last4, status, risk_score, risk_level, fraud_probability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user['id'], $ref, $amount, $merchant, $location,
        $category, $cardLast4, $status, $riskScore, $riskLevel, $fraudProb
    ]);
    $newId = $db->lastInsertId();

    // If fraud detected, create notification
    if ($riskLevel === 'high' || $status === 'fraud') {
        $db->prepare("
            INSERT INTO notifications (user_id, title, message, type, transaction_id)
            VALUES (?, '🚨 Fraud Alert', ?, 'fraud_alert', ?)
        ")->execute([
            $user['id'],
            "High-risk transaction detected: \$$amount at $merchant ($location). Fraud probability: " . round($fraudProb * 100, 1) . "%",
            $newId
        ]);
        logAction($db, $user['id'], 'fraud_detected', 'transactions', $newId, "Fraud detected: $ref", 'critical');
    } else {
        logAction($db, $user['id'], 'transaction_created', 'transactions', $newId, "Transaction $ref submitted");
    }

    $newTxn = $db->prepare("SELECT * FROM transactions WHERE id = ?")->execute([$newId]);
    jsonSuccess(['id' => $newId, 'transaction_ref' => $ref, 'status' => $status], 'Transaction saved');
}

jsonError('Method not allowed', 405);
