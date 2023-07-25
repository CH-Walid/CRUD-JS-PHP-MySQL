<?php

function sendJsonResponse($data)
{
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}

$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

if ($data !== null) {
  $key = $data['key'];

  $host = 'localhost';
  $username = 'root';
  $password = '';
  $dbname = 'admins';
  $table = 'member';

  try {

    $dsn = "mysql:host=$host;dbname=$dbname";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::FETCH_DEFAULT, PDO::FETCH_ASSOC);

    if ($key === 'getExistingData') {
      $start = intval($data['start']);
      $limit = intval($data['limit']);

      $selectAll = $pdo->prepare("SELECT id, name, email FROM $table LIMIT :start, :limit");
      $selectAll->bindParam(':start', $start, PDO::PARAM_INT);
      $selectAll->bindParam(':limit', $limit, PDO::PARAM_INT);
      $selectAll->execute();

      if ($selectAll->rowCount() > 0) {
        $rows = $selectAll->fetchAll();
        sendJsonResponse($rows);
      } else {
        sendJsonResponse(['reachedMax' => true]);
      }
    }

    if ($key === 'getTotalMembers') {
      $countRows = $pdo->query("SELECT COUNT(id) AS totalMembers FROM $table");
      sendJsonResponse($countRows->fetch());
    }

    if ($key === 'addMember') {
      $name = $data['name'];
      $email = $data['email'];

      $insertStmt = $pdo->prepare("INSERT INTO $table(name, email) VALUES(:name, :email)");
      $insertStmt->bindParam(':name', $name);
      $insertStmt->bindParam(':email', $email);

      if ($insertStmt->execute()) {
        sendJsonResponse(['success' => true]);
      } else {
        sendJsonResponse(['success' => false]);
      }
    }

    if ($key === "getRowData") {
      $id = $data['id'];

      $findStmt = $pdo->prepare("SELECT id, name, email FROM $table WHERE id = :id");
      $findStmt->bindParam(':id', $id, PDO::PARAM_INT);
      $findStmt->execute();

      if ($row = $findStmt->fetch()) {
        sendJsonResponse($row);
      }
    }

    if ($key === 'updateRow') {
      $newId = intval($data['id']);
      $newName = $data['name'];
      $newEmail = $data['email'];

      $updateStmt = $pdo->prepare("UPDATE $table SET name = :name, email = :email WHERE id = :id");
      $updateStmt->bindParam(':name', $newName);
      $updateStmt->bindParam(':email', $newEmail);
      $updateStmt->bindParam(':id', $newId, PDO::PARAM_INT);

      if ($updateStmt->execute()) {
        sendJsonResponse(['success' => true]);
      } else {
        sendJsonResponse(['success' => false]);
      }
    }

    if ($key === 'deleteRow') {
      $id = intval($data['id']);

      $deleteStmt = $pdo->prepare("DELETE FROM $table WHERE id = :id");
      $deleteStmt->bindParam(':id', $id, PDO::PARAM_INT);
      if ($deleteStmt->execute()) {
        sendJsonResponse(['success' => true]);
      } else {
        sendJsonResponse(['success' => false]);
      }
    }
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred while processing the request.']);
    exit();
  }
}
