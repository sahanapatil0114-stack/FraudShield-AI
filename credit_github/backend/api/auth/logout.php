<?php
require_once __DIR__ . '/../../config/cors.php';
setCORSHeaders();
handlePreflight();
session_start();
session_destroy();
jsonSuccess(null, 'Logged out successfully');
