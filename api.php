<?php
// Set headers for JSON response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "localhost";
$db_name = "steyndig_events";
$username = "steyndig_events";
$password = "K6F6PMDSDHcWQpcR2xb2";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    // Set error mode to exception so we can catch database issues
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit;
}

// POST new event
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($data) {
        try {
            $sql = "INSERT INTO events (date, title, description, image) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['date'], 
                $data['title'], 
                $data['desc'], 
                $data['image']
            ]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No data received"]);
    }
    exit; // Stop script execution after POST
}

// GET events
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM events");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Fetch failed: " . $e->getMessage()]);
    }
    exit;
}
?>