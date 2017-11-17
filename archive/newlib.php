<?php

if ($_FILES) {

    $success_count = 0;
    $error = Array();

    $db = new mysqli('localhost','root','','music') or die('Connecting Database music Error');
    $res =  $db->query('SELECT AUTO_INCREMENT FROM  information_schema.TABLES
WHERE TABLE_SCHEMA = "music" AND TABLE_NAME   = "tracks"')->fetch_array();
    $id = $res['AUTO_INCREMENT'];

    foreach ($_FILES as $file) {
        $name = str_pad($id, 11, '0', STR_PAD_LEFT).'.'.str_replace('audio/','',$file['type']);
        $path = "C:/wamp64/www/mein/music/content/$name";
        if(move_uploaded_file($file['tmp_name'],$path)) {

            $db->query("INSERT INTO tracks (name, path) values ('$name','$path')");
            $id++;
            $success_count++;
        } else {
            array_push($error, $file['name']);
        }
    }
    if ($success_count==count($_FILES))
        $success_report = 'Все файлы успешно загружены';
    else
        $success_report = 'Произошла ошибка при загрузке следующих файлов: '.implode(', ', $error);

    echo "$success_count файлов успешно загружено. $success_report";

} else {
    echo '000';
}