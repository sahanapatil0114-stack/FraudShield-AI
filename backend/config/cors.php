<?php
// ============================================================
// FraudShield AI - CORS & Response Helpers
// ============================================================

require_once __DIR__ . '/jwt.php';

function setCORSHeaders(): void {
    $allowed = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ];

    if (defined('CORS_ORIGIN') && CORS_ORIGIN) {
        $allowed[] = CORS_ORIGIN;
    }
    if ($extra = getenv('CORS_ORIGINS')) {
        $allowed = array_merge($allowed, array_map('trim', explode(',', $extra)));
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && (
        in_array($origin, $allowed, true)
        || preg_match('#^https://[a-z0-9-]+\.onrender\.com$#i', $origin)
        || preg_match('#^https://[a-z0-9-]+\.(infinityfreeapp|epizy|rf\.gd|42web)\.com$#i', $origin)
    )) {
        header("Access-Control-Allow-Origin: $origin");
    } elseif ($origin && preg_match('#^https://#i', $origin)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=UTF-8');
}

function handlePreflight(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function jsonError(string $message, int $status = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $status);
}

function jsonSuccess(mixed $data = null, string $message = 'OK'): void {
    $resp = ['success' => true, 'message' => $message];
    if ($data !== null) $resp['data'] = $data;
    jsonResponse($resp);
}

function getRequestBody(): array {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

function requireAuth(): array {
    require_once __DIR__ . '/database.php';

    $token = get_bearer_token();
    if ($token) {
        $payload = jwt_decode($token);
        if ($payload && isset($payload['id'])) {
            $db = getDB();
            $stmt = $db->prepare('SELECT id, name, email, role, phone FROM users WHERE id = ? AND is_active = 1');
            $stmt->execute([(int)$payload['id']]);
            $user = $stmt->fetch();
            if ($user) return $user;
        }
    }

    if (session_status() === PHP_SESSION_NONE) session_start();
    if (isset($_SESSION['user'])) return $_SESSION['user'];

    jsonError('Unauthorized. Please log in.', 401);
}

function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonError('Forbidden. Admin access required.', 403);
    }
    return $user;
}

function logAction(PDO $db, ?int $userId, string $action, string $entityType = '', ?int $entityId = null, string $description = '', string $severity = 'info'): void {
    try {
        $stmt = $db->prepare("
            INSERT INTO system_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent, severity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $action,
            $entityType,
            $entityId,
            $description,
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
            $severity
        ]);
    } catch (Exception $e) {
        // Non-fatal
    }
}
