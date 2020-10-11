<?php 

//ini_set('display_errors', '1');
//ini_set('display_startup_errors', '1'); 
//error_reporting(E_ALL);

//ini_set('allow_url_fopen', '1');
//echo "<pre>";

$incidents=[];
$temp=[];
$url=$_GET['url'];
$shortName=$_GET['shortName'];
$format = $_GET['format'];
//$url = "https://www.qfes.qld.gov.au/data/alerts/bushfireAlert.xml";

if($format ==='xml'){
$xmlstr = get_xml_from_url($url);
    //Replace the georss
$xmlstrclean = str_replace('georss:point','point',$xmlstr);
$xmlstrclean1 = str_replace('geo:long','geolong',$xmlstrclean);
$xmlstrclean2 = str_replace('geo:lat','geolat',$xmlstrclean1);
    
//$xmlstrclean2 = str_replace('itemt','entry',$xmlstrclean);
$data = new SimpleXMLElement($xmlstrclean2);
    
}else if($format ==='json'){
    
 $raw = get_xml_from_url($url);  
 if ($raw === false) {
    return $incidents;
 }
    $data = json_decode($raw, true);
     
}



 //echo "<pre>";
       

switch ($shortName) {
    case 'ACT':
        foreach($data->channel->item as $entry)
            {
                $temp["title"]=(string)$entry->title;

                $geo = explode(" ", $entry->point);


                $temp["lat"]=(string)$geo[0];
                $temp["long"]=(string)$geo[1];
                $temp["longdesc"]=(string)$entry->description;
                $temp["published"]= (string)$entry->pubDate;
                $temp["updated"]= (string)$entry->pubDate;
                $incidents[] = $temp;
            }
        break;
    case 'NSW':
        foreach($data['features'] as $entry)
            {
                //print_r($entry['geometry']['geometries'][0]['coordinates']);
                $temp["title"]=(string)$entry['properties']['title'];

                $temp["lat"]=(string)$entry['geometry']['geometries'][0]['coordinates'][1];
                $temp["long"]=(string)$entry['geometry']['geometries'][0]['coordinates'][0];
                $temp["longdesc"]=(string)$entry['properties']['description'];
                $temp["published"]= (string)$entry['properties']['pubDate'];
                $temp["updated"]= (string)$entry['properties']['pubDate'];
                $incidents[] = $temp;
            }
      
        break;
    case 'QLD':
        
        foreach($data->entry as $entry)
            {
                $temp["title"]=(string)$entry->title;

                $geo = explode(" ", $entry->point);


                $temp["lat"]=(string)$geo[0];
                $temp["long"]=(string)$geo[1];
                $temp["longdesc"]=(string)$entry->content;
                $temp["published"]= (string)$entry->published;
                $temp["updated"]= (string)$entry->updated;
                $incidents[] = $temp;
            }
        
        
        break;
    case 'WA':
        foreach($data->channel->item as $entry)
            {
                $temp["title"]=(string)$entry->title;

                $geo = explode(" ", $entry->point);


                $temp["lat"]=(string)$entry->geolat;
                $temp["long"]=(string)$entry->geolong;
                $temp["longdesc"]=(string)$entry->description;
                $temp["published"]= (string)$entry->pubDate;
                $temp["updated"]= (string)$entry->pubDate;
                $incidents[] = $temp;
            }
        break;
    case 'NT':
        echo "i equals 2";
        break;
    case 'TAS':
      foreach($data->channel->item as $entry)
            {
                $temp["title"]=(string)$entry->title;

                $geo = explode(" ", $entry->point);


                $temp["lat"]=(string)$geo[0];
                $temp["long"]=(string)$geo[1];
                $temp["longdesc"]=(string)$entry->description;
                $temp["published"]= (string)$entry->pubDate;
                $temp["updated"]= (string)$entry->pubDate;
                $incidents[] = $temp;
            }
        break;
    case 'VIC':
               
        $datajson = json_encode($data);
        
         $jsonArray= json_decode($datajson, true);
            
        foreach($jsonArray['incident'] as $entry)
            {
                //print_r($entry);
                //$entry = str_replace('-','_',$entry);
            
                $temp["title"]=(string)$entry['name'];

                $temp["lat"]=(string)$entry['@attributes']['latitude'];
                $temp["long"]=(string)$entry['@attributes']['longitude'];
                $temp["longdesc"]=(string)$entry['category1']. ' at '. (string)$entry['incident-location'] .' '. (string)$entry['municipality'] ." ". (string)$entry['name'] .'. Being managed by ' . $entry['agency'];
                $temp["published"]= (string)$entry['origin-date-time-str'];
                $temp["updated"]= (string)$entry['last-updated-dt-str'];
                $incidents[] = $temp;
            }
        break;
    case 'SA':
        foreach($data as $entry)
            {
                //print_r($entry['geometry']['geometries'][0]['coordinates']);
                $temp["title"]=(string)$entry['Type'] . ' at ' . (string)$entry['Location_name'];
                $geo = explode(",", $entry['Location']);

                $temp["lat"]=(string)$geo[0];
                $temp["long"]=(string)$geo[1];
                $temp["longdesc"]=(string)$entry['Type'].' that is ' . (string)$entry['Status'].' at ' . (string)$entry['Location_name'];
                $temp["published"]= (string)$entry['Date'] . ' ' . (string)$entry['Time'];
                $temp["updated"]= (string)$entry['Date'] . ' ' . (string)$entry['Time'];
                $incidents[] = $temp;
                
            }
        break;


        
}

 // echo "</pre>";

echo json_encode($incidents);

function get_xml_from_url($url){
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');

    $xmlstr = curl_exec($ch);
    curl_close($ch);

    return $xmlstr;
}

?>


