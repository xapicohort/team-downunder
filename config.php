<?php 
header("Content-Type: application/json");
//ini_set('display_errors', '1');
//ini_set('display_startup_errors', '1'); 
//error_reporting(E_ALL);

// Read the file contents into a string variable,
// and parse the string into a data structure

//get the values and update 

//If setting
if($_REQUEST['action']=='set'){
//for each item being received, write the config data as a string

//Now replace the existing file

$data = 'Config = {
	"authkey": "'.$_REQUEST['authpoint'].'",
	"endpoint": "'.$_REQUEST['endpoint'].'",
	"mapBoxToken": "'.$_REQUEST['mapBoxToken'].'",
    "objectID" : "'.$_REQUEST['objectID'].'",
    "rootURL" : "'.$_REQUEST['rootURL'].'",
    "dashboard":"'.$_REQUEST['dashboard'].'",
    "radius":"'.$_REQUEST['radius'].'",
    "googleMapsAPI":"'.$_REQUEST['googleMapsAPI'].'",
}';
    
    
 
// Modify the value, and write the structure to a file "data_out.json"
//
    
$fh = fopen("conf/config.json", 'w')
      or die("Error opening output file");
fwrite($fh, $data);
fclose($fh);

 $str_data = file_get_contents("conf/config.json");
echo json_decode(json_encode($str_data));   
    
}
//if getting
if($_REQUEST['action']=='get'){
    $str_data = file_get_contents("conf/config.json");
    echo json_decode(json_encode($str_data));
}