<?php
require_once __DIR__ . '/../../config/cors.php';
setCORSHeaders();
handlePreflight();
session_start();
if (!isset($_SESSION['user'])) {
    jsonError('Not authenticated', 401);
}
jsonSuccess($_SESSION['user']);
