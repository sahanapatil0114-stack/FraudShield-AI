<?php
require_once __DIR__ . '/../../config/cors.php';

setCORSHeaders();
handlePreflight();

$user = requireAuth();
jsonSuccess($user);
