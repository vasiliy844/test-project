<?php
/**
 * index.php — обработка AJAX-запроса формы обратной связи.
 *
 * Принимает JSON: { "name": "...", "email": "..." }
 * Возвращает JSON: { "success": bool, "message": "..." }
 */

header('Content-Type: application/json; charset=utf-8');

// Разрешаем только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Метод не разрешён.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Читаем тело запроса и парсим JSON
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Некорректные данные запроса.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Очищаем данные
$name  = trim($data['name']  ?? '');
$email = trim($data['email'] ?? '');

$errors = [];

// ---- Проверка имени ----
if ($name === '') {
    $errors[] = 'Поле «Имя» не должно быть пустым.';
} elseif (mb_strlen($name) < 2) {
    $errors[] = 'Имя должно содержать минимум 2 символа.';
}

// ---- Проверка e-mail ----
if ($email === '') {
    $errors[] = 'Поле «E-mail» не должно быть пустым.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Введите корректный e-mail.';
}

// ---- Если есть ошибки ----
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---- Всё корректно ----
// В реальном проекте здесь была бы отправка письма (mail() или PHPMailer).
// Для тестового задания просто возвращаем успех.

echo json_encode([
    'success' => true,
    'message' => 'Спасибо, заявка принята!'
], JSON_UNESCAPED_UNICODE);
exit;