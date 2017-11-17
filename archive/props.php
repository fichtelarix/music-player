<?php


$name = '00000000002.mp3';
$file = "C:/wamp64/www/mein/music/content/$name";

echo json_encode(xattr_list($file));