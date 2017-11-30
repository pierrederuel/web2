<?php // In PHP versions that happen to be earlier than 4.1.0, 


// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}
// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

}
/*
$uploaddir = './uploads'; 
$uploadfile = $uploaddir . basename($_FILES['userfile']['name']); 
echo '<pre>'; if (move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile)) { 
echo "The file is valid, and has been uploaded with success.\n"; } 
else { echo "Something is amiss here!\n"; } 
echo 'Here is some debugging information for you:'; print_r($_FILES); print "</pre>"; ?>
*/
function gen_uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        // 32 bits for "time_low"
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),

        // 16 bits for "time_mid"
        mt_rand( 0, 0xffff ),

        // 16 bits for "time_hi_and_version",
        // four most significant bits holds version number 4
        mt_rand( 0, 0x0fff ) | 0x4000,

        // 16 bits, 8 bits for "clk_seq_hi_res",
        // 8 bits for "clk_seq_low",
        // two most significant bits holds zero and one for variant DCE1.1
        mt_rand( 0, 0x3fff ) | 0x8000,

        // 48 bits for "node"
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

$fileName = $_FILES['file']['name'];
$fileType = $_FILES['file']['type'];
$fileContent = file_get_contents($_FILES['file']['tmp_name']);
$fichier = gen_uuid();
$dataUrl = 'data:' . $fileType . ';base64,' . base64_encode($fileContent);
$json = json_encode(array(
  'name' => $fichier.'.'.pathinfo($fileName, PATHINFO_EXTENSION),
  'type' => $fileType,
  'dataUrl' => $dataUrl
));


$dossier = './img/users/';


     $fichier = strtr($fichier, 
          'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ', 
          'AAAAAACEEEEIIIIOOOOOUUUUYaaaaaaceeeeiiiioooooouuuuyy');
     $fichier = preg_replace('/([^.a-z0-9]+)/i', '-', $fichier);
     
     //echo $dossier.$fichier;

     $fichierlol = $fichier.'.'.pathinfo($fileName, PATHINFO_EXTENSION);

     if(move_uploaded_file($_FILES['file']['tmp_name'], $dossier.$fichierlol)) //Si la fonction renvoie TRUE, c'est que ça a fonctionné...
     {
          echo $json;
     }
     else //Sinon (la fonction renvoie FALSE).
     {
          echo 'Echec de l\'upload !';
     }


