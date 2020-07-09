<?php
//print_r($_FILES); //this will print out the received name, temp name, type, size, etc.

if (isset($_POST['bairro'])){
    $bairro = $_POST['bairro'];
}if (isset($_POST['cidade'])){
    $cidade = $_POST['cidade'];
}if (isset($_POST['latitude'])){
    $latitude = $_POST['latitude'];
}if (isset($_POST['longitude'])){
    $longitude = $_POST['longitude'];
}if (isset($_POST['permission'])){
    $permission = $_POST['permission'];
}

$size = $_FILES['audio_data']['size']; //the size in bytes
$input = $_FILES['audio_data']['tmp_name']; //temporary name that PHP gave to the uploaded file
//$output = $_FILES['audio_data']['name'].".wav"; //letting the client control the filename is a rather bad idea

//move the file from temp name to local folder using $output name
//move_uploaded_file($input, $output);
//echo "Áudio: ".$output."\n";
echo "Permission:".$permission."\n";
if ($permission === "true"){
    echo("Latitude: $latitude \n");
    echo("Longitude: $longitude \n");
    $loc = "__".$latitude.",".$longitude;
}else{
    echo("Bairro: $bairro \n");
    echo("Cidade: $cidade \n");
    $loc = "__".$cidade.",".$bairro;
}

// Move o arquivo da pasta temporaria de upload para a pasta de destino 
$dir = "novos_relatos/"; 

if (move_uploaded_file($input, "$dir/".$_FILES['audio_data']['name'].$loc.".wav")) { 
    echo "Arquivo enviado com sucesso! \n"; 
} 
else { 
    echo "Erro, o arquivo nao enviado! \n"; 
}  

?>