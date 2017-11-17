<?php

$db = new mysqli('localhost','root','','music') or die('Connecting Database music Error');
$db->query('SET NAMES "utf8"');



SWITCH ($_SERVER['REQUEST_METHOD']) {

    case 'GET':

        $array = explode('/',$_SERVER['REQUEST_URI']);
        $string = array_pop($array);
        $array = explode('_', $string);
        $type = $array[0];
        $type_id = $type.'_id';
        $table = $type.'s';
        $id = $array[1];

        $res = $db->query("SELECT * FROM $table WHERE $type_id = '$id'")->fetch_all(MYSQLI_ASSOC);
        echo json_encode($res[0]);

        break;

    case 'PUT':

        $data = json_decode(file_get_contents('php://input'), $assoc = true);
        $type = $data['type'];
        $type_id = $type.'_id';
        $table = $type.'s';
        $data = $data['data'];
        $id = $data[$type_id];

        unset($data[$type_id]);
        $set = '';

        foreach ($data as $key => $value) {
            $set .= "$key = \"$value\", ";
        }

        $set = substr($set, 0, -2);
        $db->query("UPDATE $table SET $set WHERE $type_id = '$id'");

        $answer = $db->query("SELECT * FROM $table WHERE $type_id = '$id'")->fetch_assoc();

        echo json_encode($answer);


        break;

}
