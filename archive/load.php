<?php

$db = new mysqli('localhost','root','','music') or die('Connecting Database music Error');

$res = $db->query('SELECT * FROM tracks')->fetch_all(MYSQLI_ASSOC);

echo json_encode($res);