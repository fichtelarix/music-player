<?php

$db = new mysqli('localhost','root','','music') or die('Connecting Database music Error');
$db->query('SET NAMES "utf8"');


SWITCH ($_SERVER['REQUEST_METHOD']) {

    case 'GET':

        $res = $db->query('SELECT t.*, b.band_name, g.genre_name, a.* FROM tracks t 
        LEFT JOIN bands b ON t.band_id = b.band_id
        LEFT JOIN genres g ON t.genre_id = g.genre_id
        LEFT JOIN albums a ON t.album_id = a.album_id
        ORDER BY t.id')->fetch_all(MYSQLI_ASSOC);
        echo json_encode($res);

        break;

    case 'POST':

        if ($_FILES) {

            $db = new mysqli('localhost','root','','music') or die('Connecting Database music Error');
            $res =  $db->query('SELECT AUTO_INCREMENT FROM  information_schema.TABLES
WHERE TABLE_SCHEMA = "music" AND TABLE_NAME   = "tracks"')->fetch_array();
            $id = $id_first = $res['AUTO_INCREMENT'];

            foreach ($_FILES as $file) {
                $name = str_pad($id, 11, '0', STR_PAD_LEFT).'.'.str_replace('audio/','',$file['type']);
                $path = "C:/wamp64/www/mein/music/content/$name";
                if(move_uploaded_file($file['tmp_name'],$path)) {

                    $db->query("INSERT INTO tracks (name, path) values ('$name','$path')");
                    $id++;
                }
            }
            $loaded = $db->query("SELECT t.*, b.band_name, g.genre_name, a.album_name, a.cover, a.quantity, a.year FROM tracks t
              LEFT JOIN bands b ON t.band_id = b.band_id
              LEFT JOIN genres g ON t.genre_id = g.genre_id
              LEFT JOIN albums a ON t.album_id = a.album_id
              WHERE id >= '$id_first' ORDER BY t.id")->fetch_all(MYSQLI_ASSOC);

            echo json_encode($loaded);

        }

        break;

    case 'PUT':

        $data = json_decode(file_get_contents('php://input'), $assoc = true);

        $data = $data['data'];

        $id = $data['id'];

        $entry = array('title' => $data['title']);

        $tables = array('band', 'genre', 'album');

        foreach ($tables as $table) {
            $table_id = $table.'_id';
            $table_name = $table.'s';
            $attr = $table.'_name';

            $res = $db->query("SELECT $table_id FROM $table_name WHERE $attr = '$data[$attr]'")->fetch_row();
            if($res) {

                if(in_array($data[$table_id], $res))
                    $entry[$table_id] = $data[$table_id];
                else
                    $entry[$table_id] = $res[0];
            }
            else {

                $db->query("INSERT INTO $table_name ($attr) values ('$data[$attr]')");
                $entry[$table_id] = $db->insert_id;
            }
        }

        $set = '';

        foreach ($entry as $key => $value) {
            $set .= "$key = '$value', ";
        }

        $set = substr($set, 0, -2);


        $db->query("UPDATE tracks SET $set WHERE id = $id");

        $updated = $db->query("SELECT t.*, b.band_name, g.genre_name, a.album_name, a.cover, a.quantity, a.year FROM tracks t
              LEFT JOIN bands b ON t.band_id = b.band_id
              LEFT JOIN genres g ON t.genre_id = g.genre_id
              LEFT JOIN albums a ON t.album_id = a.album_id
              WHERE id = '$id'")->fetch_all(MYSQLI_ASSOC);

        echo json_encode($updated[0]);


        break;

    case 'DELETE':

        $array = explode('/',$_SERVER['REQUEST_URI']);
        $id = array_pop($array);

        $path = $db->query("SELECT path FROM tracks WHERE id = '$id'")->fetch_row()[0];

        $db->query("DELETE FROM tracks WHERE id = '$id'");

        unlink($path);


        break;

}