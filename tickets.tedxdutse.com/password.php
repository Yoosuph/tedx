<?php
$password = 'theTEDx'; // Change this to your desired password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
echo "Hashed password: " . $hashed_password;
?>