<?php

$db = new mysqli('localhost','root','','music') or die('Connecting Database music Error');
$db->query('SET NAMES "utf8"');


if ($_POST && $_FILES) {

    $table = $_POST['type'].'s';
    $type_id = $_POST['type'].'_id';
    $id = $_POST['id'];

    SWITCH ($_POST['type']) {
        case 'album':
            $folder = 'C:/wamp64/www/mein/music/content/covers/';
            $cell = 'cover';
            break;
        case 'band':
            $folder = 'C:/wamp64/www/mein/music/content/logos/';
            $cell = 'logo';
            break;
    }

    $path = $folder.$db->query("SELECT $cell FROM $table WHERE $type_id = '$id'")->fetch_row()[0];
    unlink($path);

    $name = str_pad($id, 11, '0', STR_PAD_LEFT).uniqid().'.'.str_replace('image/','',$_FILES['image']['type']);
    $path = $folder.$name;
    if(move_uploaded_file($_FILES['image']['tmp_name'],$path)) {
        $db->query("UPDATE $table SET $cell = '$name' WHERE $type_id = '$id'");
        echo $name;
    }




}

