var geolocation = {};
var incidents =[];
var Config;
var name = "";
var email = "";
var session_id = generateUUID();
var contextReg = generateUUID();
var map=''
var currentLocation =[];
var infowindow = null;
var Circle = '';
var geocoder;
var hasCheckedIn = false;
var userOnly = false;
var markersArray = [];
var InfoWindowArray = [];
var CirclesArray = [];

//$('head').append('<script defer src="https://maps.googleapis.com/maps/api/js?key='+Config.googleMapsAPI+'"></script>');



 var iconBase = Config.rootURL +'/images/';

     var icons = {
          mylocation: {
            icon: iconBase + 'mapbox-icon_you.png'
          },
          otherlocation: {
            icon: iconBase + 'mapbox-icon_incident.png'
          },
          incident: {
            icon: iconBase + 'mapbox-icon_other.png'
          }
        };


 

$(document).ready(function(){
 
setButtons(); 
    
    
 var locationPromise = getLocation();
locationPromise
      .then(function(loc) { 
        $('#initial').hide();
        $('#message').hide();
        
   
       // Initialize and add the map
     currentLocation = {lat: geolocation["lat"], lng: geolocation["long"]};
    $('#btnLogin').show();
      geocoder = new google.maps.Geocoder();
      map = new google.maps.Map(document.getElementById('map'), {zoom: 8, center: currentLocation,gestureHandling: "cooperative",});
    
    
      var marker = new google.maps.Marker({position: currentLocation, map: map, icon: scaleImg(iconBase + 'mapbox-icon_you.png'), title: "<b>You are here</b><br />"});
    markersArray.push(marker);
    
     infowindow = new google.maps.InfoWindow({
                content: "<b>You are here</b><br />"
              });
        InfoWindowArray.push(infowindow);
            
    
    marker.addListener("click", () => {
            infowindow.open(map, marker);
          });   
    
    Circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0,
      map: map,
     clickable: false,    
      center: currentLocation,
      radius: Config.radius * 1000 //in meters
    });
    
    CirclesArray.push(Circle);
    
    map.setOptions({ minZoom: 5, maxZoom: 15 });
    
   
     google.maps.event.addListener(map, 'click', function(event) {
         closeAllInfoWindows();
  });
    
    
    
});
    
//Load States
    

$.each(exDataSrc, function(key, value){

    $("#selectState").append('<a class="dropdown-item incidentData" href="#">'+key+'</a>');


})

//Load Config Data
    
$('#endpoint').val(Config.endpoint);
$('#authkey').val(Config.authkey);
$('#objectID').val(Config.objectID);
$('#rootURL').val(Config.rootURL);
$('#dashboard').val(Config.dashboard);
$('#radius').val(Config.radius);
$('#GoogleMapsKey').val(Config.googleMapsAPI);
$('#MapBoxToken').val(Config.mapBoxToken);
    
    
    
//Load Localstorage
    
$('#name').val(localStorage.getItem("name"));
$('#email').val(localStorage.getItem("email"));
$('#rememberme').prop('checked', localStorage.getItem("rememberme"));

name=localStorage.getItem("name");
email = localStorage.getItem("email");

//Connect to LRS
var conf = {
  "endpoint" : Config.endpoint,
  "auth" : "Basic " + toBase64(Config.authkey),
};
ADL.XAPIWrapper.changeConfig(conf); 
    
    

//This is the intial Check in from the Modal
                  
$('#btnStart').on('click',function(e){
    e.stopPropagation();
    e.preventDefault();
     
    name = $('#name').val().trim();
    email = $('#email').val().trim();
    rememberme = $('#rememberme').is(':checked'); 
    
    if(rememberme){
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          localStorage.setItem("rememberme", rememberme);
            
        } 
    }
        
    
    
    //Check fields complete
    if(name ==='' || email==='' || !isEmail(email)){
        
        $('#message').empty().html('<i class="fa fa-exclamation-triangle fa-1x"></i> Please enter your name and a valid email address.').slideDown().delay(2000).slideUp();
        return;
}
    
   
    
  
    
//We're good, sop let's send the Initialised Statement 
   hasCheckedIn = true;
   userOnly = false;    
   setButtons();
    var stmt = {"actor" : {"objectType":"Agent", "mbox" : "mailto:"+email,"name": name },
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/initialized",
                      "display" : {"en-US" : "Initialized"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/application",
                                "name": {
                                  "en-US": "ESxAPI app at location " + geolocation.lat +","+ geolocation.long
                                }
                            }},
                       "context":{
                           "registration": contextReg,
                            "contextActivities":{
                                "category":{
                                    "id":"https://w3id.org/xapi/application"
                                }
                            },
                           "extensions": {
                                "http://id.tincanapi.com/extension/latitude": geolocation.lat,
                                "http://id.tincanapi.com/extension/longitude": geolocation.long,
                                "http://id.tincanapi.com/extension/geojson":
                                   {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [geolocation.lat, geolocation.long]
                                      },
                                      "properties": {
                                        "name": reverseLookUp(geolocation.lat, geolocation.long)
                                      }
                                    },
                                "http://id.tincanapi.com/extension/browser-info": {
                                  "name": {
                                    "en-US": "browser information"
                                  },
                                  "description": {
                                    "code_name": navigator.appCodeName,
                                    "name": GetBrowser(),
                                    "version": navigator.appVersion,
                                    "platform": navigator.platform,
                                    "user-agent-header": navigator.userAgent,
                                    "cookies-enabled": navigator.cookieEnabled
                                  }
                                }
                                
                        },
                    }};
    
   //Send the statement to the LRS 
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
    $('#mdlLogin').modal('hide')
    $('#btnLogin').hide();
    
})                  
 
//Show hide Circle
$('#btnToggleCircle').on('click',function(){
    
    toggleCircles();
    
})    
    
    
//Show the Dashboard from the LRS
 $('#btnShowDashboard').on('click',function(){
     
     window.open(Config.dashboard);
     
 })   
    
   
//Run a checkin from the Checkin Button    
$('#btnCheckIn').on('click',function(e){
     e.stopPropagation();
     e.preventDefault();
   
    checkIn();
   
    
})

  
//Update the map based on the test location
$('.incidentData').on('click',function(e){
    incidents = [];
    
    //get the incidents from the server
    incidents = getIncidentData(exDataSrc[$(this).text()]);
    
 //Plot each point on the map. As we are cleaning the data, we know the structure if the returned data
    $.each(incidents,function(key, value){

       plotPointGoogleMaps(value.updated, '<b>'+value.title+'</b>' +'<br>Updated ' + value.updated +'</br>' + '<p>'+ value.longdesc +'</p>', value.lat, value.long, false,map)

        //Calculate the distance from me and if within the boundaries of the config.radius send an xAPI statement indicating the User is within the range. use GeoRSS as the extension
        var distance = Getdistance(currentLocation.lat,currentLocation.lng,value.lat,value.long,'K');
        //want to make sure the user has checkedin before sending this data
            
        if(parseFloat(distance) <= Config.radius && hasCheckedIn){ 
            
            
              
        var stmt = {"actor" : {"objectType":"Agent", "mbox" : "mailto:"+email,"name": name },
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/at",
                      "display" : {"en-US" : "was at"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/place",
                                "name": {
                                  "en-US": "Was within " +Config.radius+"kms ( actual" + Math.round(distance) + "kms of an incident at " + value.lat +","+ value.long +"."
                        }
                            }},
                       "context":{
                      "registration": contextReg,
                            "contextActivities":{
                                "category":{
                                    "id":"https://w3id.org/xapi/application"
                                }
                            },
                           "extensions": {
                                "http://id.tincanapi.com/extension/latitude": geolocation.lat,
                                "http://id.tincanapi.com/extension/longitude": geolocation.long,
                                "http://id.tincanapi.com/extension/measurement": distance,
                                "http://id.tincanapi.com/extension/geojson":
                               {
                                  "type": "FeatureCollection",
                                  "features": [
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ geolocation.lat, geolocation.long ]
                                      },
                                      "properties": {
                                        "name": reverseLookUp(geolocation.lat, geolocation.long),
                                        "distanceToIncident": Math.round(Getdistance(geolocation.lat, geolocation.long,value.lat, value.long,"K"))+"kms",  
                                      }
                                    },
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ value.lat, value.long]
                                      },
                                        "properties": {
                                        "name": value.title,
                                        "description": value.longdesc,
                                        "distanceFromUser": Math.round(Getdistance(geolocation.lat, geolocation.long,value.lat, value.long,"K"))+"kms",
                                      }
                                 },
                                  ]
                                },    
                               "http://id.tincanapi.com/extension/browser-info": {
                                  "name": {
                                    "en-US": "browser information"
                                  },
                                  "description": {
                                    "code_name": navigator.appCodeName,
                                    "name": GetBrowser(),
                                    "version": navigator.appVersion,
                                    "platform": navigator.platform,
                                    "user-agent-header": navigator.userAgent,
                                    "cookies-enabled": navigator.cookieEnabled
                                  }
                                }
                                
                        },
                        }};
    
    
   
   
   //Send the Statement to the LRS
   console.log(stmt);            
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
        }
        
        
     });
    
                        
})

//Save the settings back to the server  
$('#btnsaveSettings').on('click',function(){
    
    setConfig();
     $('#mdlSettings').modal('hide');

    
})    
 
    
//get all the users that haev checked in (looking at initislised verb) in last 24 hours    
$('#btnShowOthers').on('click',function(e){
    e.stopPropagation();
    e.preventDefault();
    getAllUsers();
    
})

    
//Just show the map. Hide all and Circle. User can still plot the incidents     
$('#btnUserOnly').on('click',function(e){

    hasCheckedIn = false;
    userOnly = true;
    e.stopPropagation();
    e.preventDefault();
    
    $('#mdlLogin').modal('hide');

    
    //clear circle
    Circle.setMap(null);
    
    setButtons();

})  
 
    
//Simulate the user Checkin    
$('#btnSimulateCheckIn').on('click',function(){
    
 if(!hasCheckedIn){
     alert('You must be Logged in (we need to know who you are) before you can use the simulator.\n\n Refresh your browser select Start Here and Check In');
     return;
 }    
    
simulateCheckin();    
    
    
})    
    
  
})


//Execute a checkin
function checkIn(){
    
     //Get current location
    getLocation();
    
    if(localStorage.getItem("rememberme")){
    email = localStorage.getItem('email');
    name = localStorage.getItem('name');
    }
    
    //get location
    
    
    var stmt = {"actor" : {"objectType":"Agent", "mbox" : "mailto:"+email,"name": name },
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/checkin",
                      "display" : {"en-US" : "checked in"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/place",
                                "name": {
                                  "en-US": "Was at location " + geolocation.lat +","+ geolocation.long
                                }
                            }},
                       "context":{
                            "registration": contextReg,
                            "contextActivities":{
                                "category":{
                                    "id":"https://w3id.org/xapi/application"
                                }
                            },
                           "extensions": {
                                "http://id.tincanapi.com/extension/latitude": geolocation.lat,
                                "http://id.tincanapi.com/extension/longitude": geolocation.long,
                               "http://id.tincanapi.com/extension/geojson":
                                   {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [geolocation.lat, geolocation.long]
                                      },
                                      "properties": {
                                        "name": reverseLookUp(geolocation.lat, geolocation.long)
                                      }
                                    },
                               
                               // We want to know the browser that the user is using, so we'll capture this too
                                "http://id.tincanapi.com/extension/browser-info": {
                                  "name": {
                                    "en-US": "browser information"
                                  },
                                  "description": {
                                    "code_name": navigator.appCodeName,
                                    "name": GetBrowser(),
                                    "version": navigator.appVersion,
                                    "platform": navigator.platform,
                                    "user-agent-header": navigator.userAgent,
                                    "cookies-enabled": navigator.cookieEnabled
                                  }
                                }
                                
                        }
               }
            }
                        
    
    
   
   
   var datetime = "Checked in at: " + new Date().today() + " @ " + new Date().timeNow();
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
   L.marker([geolocation.lat, geolocation.long]).addTo(mymap)
		.bindPopup("<b>"+name+"</b><br />"+ datetime).openPopup()
    markersArray.push(marker);

}; 

    
 

//This gets a list of users based on last checkin Verb

function getAllUsers(){
    
   var Last24Hours = new Date(Date.now() - 86400 * 1000).toISOString();
    
    
    //xapiResults
    var search = ADL.XAPIWrapper.searchParams();
    search['related_activities'] = "true";
    search['verb'] = "http://adlnet.gov/expapi/verbs/initialized";
    
    //xapiResults
    search["since"] = Last24Hours; /* Returns statements since Jan 1, 2020 */

    var res = ADL.XAPIWrapper.getStatements(search);
    //Now loop through each one and add to the map
    
     
    //We only want the last checkin of each user. As the results are returned
    //in ascending order by the LRS, we can filter and remove the ones we don't want    
           
    var Users = {};
        res.statements.forEach( function( item ) {
            
            
            var user = Users[item.actor.mbox] = Users[item.actor.mbox] || {};
            var PlaceName = '';
            thedate = new Date(item.timestamp);
            user ['name'] = item.actor.name +  + " checked in <br>at " + formatDate(thedate);
                
             if(item.context.extensions['http://id.tincanapi.com/extension/latitude']){ //Test that the location was captured                  
                 var locationurl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+item.context.extensions['http://id.tincanapi.com/extension/longitude']+','+item.context.extensions['http://id.tincanapi.com/extension/latitude']+'.json?types=place&access_token='+Config.mapBoxToken;
    
            $.ajax({
             async: false,
             type: 'GET',
             url: locationurl,
             success: function(result){
                 try{
                user ['name'] = item.actor.name+ " checked in <br>at " + result.features[0].text + " on " + formatDate(thedate);
                 }catch(e){
                     //fallback
                     user ['name'] = item.actor.name +  + " checked in <br>at " + formatDate(thedate);
                     
                 }
                 
             }
            })

            
             }
            
            user['lat'] = item.context.extensions['http://id.tincanapi.com/extension/latitude'];
            user['long'] = item.context.extensions['http://id.tincanapi.com/extension/longitude'];
            user['timestamp'] = item.timestamp;
            user['attachments'] = item.attachments;

        });

    
    $.each( Users, function( key, value ) {
           
           	
           var message = value['name']
           
           //Check if there are any images as attachments
           if(value.attachments){
               message += "<br><button class='showPhotos btn btn-sm btn-primary' data-lat='"+value['lat']+"' data-long='"+value['long']+"'><i class='fa fa-camera'></i> View Photos</button>";
               
           } 
         
        var myLatLng ='';
        if(value['lat']){
            
                
             myLatLng = { lat: parseFloat(value['lat']), lng: parseFloat(value['long']) };
             infowindow = new google.maps.InfoWindow({
                content: message
              });
            
            InfoWindowArray.push(infowindow);
             var marker = new google.maps.Marker({position: myLatLng, map: map,  icon: scaleImg(iconBase + 'mapbox-icon_other.png'), title: message});
             marker.addListener("click", () => {
            infowindow.open(map, marker);
                 markersArray.push(marker);
          });
            
            
        }
        
    })

    
}

function closeAllInfoWindows() {
  for (var i=0;i<InfoWindowArray.length;i++) {
     InfoWindowArray[i].close();
  }
}


// Removes the overlays from the map, but keeps them in the array
function clearOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}



// Deletes all markers in the array by removing references to them
function deleteOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  }
}
function plotPointGoogleMaps(theDate, Title, lat, long, attachments,map){
        
    
     try {
            //thedate = new Date(theDate);	
           var message = Title + '<br/>' + ' on '+ theDate +'</br>' ;
           
           //Check if there are any images as attachments
           if(attachments){
               Title += "<br><button class='btn btn-sm btn-primary' data-lat='"+lat+"' data-long='"+long+"'><i class='fa fa-camera'></i> View Photos</button>";
               
           } 
         
              myLatLng = { lat: parseInt(lat), lng: parseInt(long) };
            const infowindow = new google.maps.InfoWindow({
                content: message
              });
         
           InfoWindowArray.push(infowindow);
          
             var marker = new google.maps.Marker({position: myLatLng, map: map,  icon: scaleImg(iconBase + 'mapbox-icon_incident.png'), title: message});
              markersArray.push(marker);
       
             marker.addListener("click", () => {
           infowindow.open(map, marker);
                 
          });
         
        
            
     }catch(err){
         console.log(err.message);
     }

        
    
    
}






function getIncidentData(dataObject){
    incidents = [];
   $.ajax({
     url: Config.rootURL+'/getgeorss.php',
     data:{ url:dataObject.dataURL, shortName: dataObject.shortName, format: dataObject.format},
     type:'GET',
     dataType:'json',
     async:false,
     success: function(result) {
         
        $.each(result, function(key,value) {
           var item={};
            
            item['lat']=value.lat;
            item['long']=value.long;
            item['title']=value.title;
            item['longdesc']=value.longdesc;
            item['published']=value.published;
            item['updated']=value.updated;
            
            incidents.push(item);
            
            
        });
         
         
        }
    })
    
    return incidents;
    
    
}
          
function setConfig(){
    
var data = { 'endpoint':$('#endpoint').val(),
'authpoint':$('#authkey').val(),
'objectID':$('#objectID').val(),
'rootURL':$('#rootURL').val(),
'dashboard':$('#dashboard').val(),
'radius':$('#radius').val(),
'action':'set',
'googleMapsAPI':$('#GoogleMapsKey').val(),
'mapBoxToken':$('#MapBoxToken').val()
};
   
    $.ajax({
             async: false,
             type: 'GET',
             dataType: 'json',
             data: data,
             url: Config.rootURL+'/config.php',
             success: function(result){
                     //saved so update the Config details
                 
                     Config = result;
                 
              }
        }) 
    
    
    
}

function getConfig(){
    //Config
    $.ajax({
             async: false,
             type: 'GET',
             dataType: 'json',
             data: {'action':'get'},
             url: Config.rootURL+'/config.php',
             success: function(result){
                     Config = result;
    
              }
        })
    


    
}


/***** Helper Functions *****/


function setButtons(){
    
//Set initial button status
$('#buttons').hide();    
$('#dropdownMenuButton').hide();       
$('#btnCheckIn').attr('disabled','disabled'); 
$('#btnSettings').hide();
$('#btnToggleCircle').hide();   
$('#btnLogin').hide();
//Set if checked in AND have GPS
    
if(hasCheckedIn && !userOnly){
    
$('#buttons').show();    
$('#dropdownMenuButton').show();       
$('#btnLogin').hide();   
$('#btnCheckIn').removeAttr('disabled').show(); 
$('#btnSettings').show();
$('#btnToggleCircle').show();    
$('#btnLogin').show();    
    
}
    
if(userOnly && !hasCheckedIn){
    
  $('#btnToggleCircle').show();    
  $('#dropdownMenuButton').show();   
  $('#buttons').show();    
  
   
}
    
    
    
    
    
}


function toggleCircles(){
    
Circle.setMap(Circle.getMap() ? null : map);
        
}
 
//Simulate the user checkin
function simulateCheckin(){

    
//remove the current location and circle    
//first marker is ALWAYS the checkin user
deleteOverlays();    

//Clear circles    
Circle.setMap(null);
//get a random state from exData and plot
const values = Object.values(exDataSrc)
const randomData = values[parseInt(Math.random() * values.length)]    

incidents = getIncidentData(randomData);
//check if there are any incidents and if not, try again
    
$.each(incidents,function(key, value){

      plotPointGoogleMaps(value.updated, '<b>'+value.title+'</b>' +'<br>Updated ' + value.updated +'</br>' + '<p>'+ value.longdesc +'</p>', value.lat, value.long, false,map);
})

//select a random marker from marker[]    
    
var newMarker = markersArray[Math.floor(markersArray.length * Math.random())];    
//calculate a new location < config.radius    
var MarkerPosition = newMarker.getPosition();    
var NewPosition = getRandomLocation(MarkerPosition.lat(),MarkerPosition.lng(),Config.radius*1000);
    
//plot new location
var newLocation = [];    
 NewLocation = {lat: NewPosition["latitude"], lng: NewPosition["longitude"]};
    
      var marker = new google.maps.Marker({position: NewLocation, map: map, icon: scaleImg(iconBase + 'mapbox-icon_you.png'), title: "<b>You are here</b><br />"});
    markersArray.push(marker);
    
     infowindow = new google.maps.InfoWindow({
                content: "<b>You are here</b><br />"
              });
        InfoWindowArray.push(infowindow);
            
    
    marker.addListener("click", () => {
            infowindow.open(map, marker);
          });   
    
    Circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0,
      map: map,
     clickable: false,    
      center: NewLocation,
      radius: Config.radius * 1000 //in meters
    });
    
    CirclesArray.push(Circle);
    
    map.setOptions({ minZoom: 5, maxZoom: 15 });    
//update the circle and send simulated
  
    
//Zoom to location
map.setZoom(8);      // This will trigger a zoom_changed on the map
map.setCenter(new google.maps.LatLng(NewPosition["latitude"], NewPosition["longitude"]));

    
//Now will send to xAPI
    
    $.each(incidents,function(key, value){
        
        var distance = Getdistance(NewPosition["latitude"],NewPosition["longitude"],value.lat,value.long,'K');
        //want to make sure the user has checkedin before sending this data. We need to know who it is, so a user MUST checkin
            
        if(parseFloat(distance) <= Config.radius && hasCheckedIn){ 
            
            
              
        var stmt = {"actor" : {"objectType":"Agent", "mbox" : "mailto:"+email,"name": name },
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/at",
                      "display" : {"en-US" : "was at"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/place",
                                "name": {
                                  "en-US": "Was within " +Config.radius+"kms ( actual" + Math.round(distance) + "kms of an incident at " + value.lat +","+ value.long +"."
                        }
                            }},
                       "context":{
                        "registration": contextReg,
                        "contextActivities":{
                                "category":{
                                    "id":"https://w3id.org/xapi/application"
                                }
                            },
                           "extensions": {
                                "http://id.tincanapi.com/extension/latitude": NewPosition["latitude"],
                                "http://id.tincanapi.com/extension/longitude": NewPosition["longitude"],
                                "http://id.tincanapi.com/extension/measurement": distance,
                                "http://id.tincanapi.com/extension/geojson":
                               {
                                  "type": "FeatureCollection",
                                  "features": [
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ NewPosition["latitude"], NewPosition["longitude"] ]
                                      },
                                      "properties": {
                                        "name": reverseLookUp(NewPosition["latitude"], NewPosition["longitude"]),
                                        "distanceToIncident": Math.round(Getdistance(NewPosition["latitude"], NewPosition["longitude"],value.lat, value.long,"K"))+"kms",  
                                      }
                                    },
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ value.lat, value.long]
                                      },
                                        "properties": {
                                        "name": value.title,
                                        "description": value.longdesc,
                                        "distanceFromUser": Math.round(Getdistance(NewPosition["latitude"], NewPosition["longitude"],value.lat, value.long,"K"))+"kms",
                                      }
                                 },
                                  ]
                                },    
                               "http://id.tincanapi.com/extension/browser-info": {
                                  "name": {
                                    "en-US": "browser information"
                                  },
                                  "description": {
                                    "code_name": navigator.appCodeName,
                                    "name": GetBrowser(),
                                    "version": navigator.appVersion,
                                    "platform": navigator.platform,
                                    "user-agent-header": navigator.userAgent,
                                    "cookies-enabled": navigator.cookieEnabled
                                  }
                                }
                                
                        },
                        }};
    
    
   
   
   //Send the Statement to the LRS
   console.log(stmt);            
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
        }
         
        
    })
    
}


//returns a lat an long that can be plotted next to a random marker
//need to set the map center to this simulation
//check the icon to be a simulated one
//trigger the xAPI statement wit geoJSON

var getRandomLocation = function (latitude, longitude, radiusInMeters) {

    var getRandomCoordinates = function (radius, uniform) {
        // Generate two random numbers
        var a = Math.random(),
            b = Math.random();

        // Flip for more uniformity.
        if (uniform) {
            if (b < a) {
                var c = b;
                b = a;
                a = c;
            }
        }

        // It's all triangles.
        return [
            b * radius * Math.cos(2 * Math.PI * a / b),
            b * radius * Math.sin(2 * Math.PI * a / b)
        ];
    };

    var randomCoordinates = getRandomCoordinates(radiusInMeters, true);

    // Earths radius in meters via WGS 84 model.
    var earth = 6378137;

    // Offsets in meters.
    var northOffset = randomCoordinates[0],
        eastOffset = randomCoordinates[1];

    // Offset coordinates in radians.
    var offsetLatitude = northOffset / earth,
        offsetLongitude = eastOffset / (earth * Math.cos(Math.PI * (latitude / 180)));

    // Offset position in decimal degrees.
    return {
        latitude: latitude + (offsetLatitude * (180 / Math.PI)),
        longitude: longitude + (offsetLongitude * (180 / Math.PI))
    }
};



//scales the marker image to 50x50
function scaleImg(imagePath){
    
     var icon = {
        url: imagePath, // url
        scaledSize: new google.maps.Size(50, 50), // size
    };
    
    return icon;
}


//gets the current location of the user
function getLocation(callback) {
    var promise = new Promise(function(resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position){
                    resolve("@" + position.coords.latitude + "," + position.coords.longitude)
                    geolocation["lat"] = position.coords.latitude;
                    geolocation["long"] = position.coords.longitude;
                    return true;
                }
            );
        } else {
          reject("Unknown");
            return false;
        }
    });

    return promise;
}


//Reverse look up the location of where someone is based on lat and long
function reverseLookUp(lat,long){

    
           
var addressDetails ='';

var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&key='+Config.googleMapsAPI;   
    
    

            $.ajax({
             async: false,
             type: 'GET',
             url: url,
             success: function(results){
                 try{
                     
                     addressDetails = results.results[0].address_components[2].long_name + ', ' + results.results[0].address_components[3].long_name + ', ' + results.results[0].address_components[4].long_name + ', ' + results.results[0].address_components[5].long_name + ', ' + results.results[0].address_components[6].long_name;
  
                     
                 }catch(e){
                     //fallback
                     addressDetails =  "Geocoder failed due to: " + e.message;
                     
                 }
                 
             }
            })    
    
    
   
        return addressDetails;

}

//Sets and Time for the xAPI Statement in the correct format    
function ISO8601_time(){
	//Duration must be set in ISO_8601 format. So 25 seconds would be P25S
	var DateTime = new Date();
	var currentTime = DateTime.getTime();	
	
	return "PT"+Math.round((currentTime /1000) - (startVideo / 1000))+"S";
	
	
}
 
//Format the date to readable
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + "  " + strTime;
}

//Generate a new UID for the statement
function generateUUID() {

  var d = new Date().getTime();

  if (window.performance && typeof window.performance.now === 'function') {

    d += performance.now(); // Use high-precision timer if available

  }

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {

    var r = (d + Math.random()*16)%16 | 0;

    d = Math.floor(d / 16);

    return (c=='x' ? r : (r&0x3|0x8)).toString(16);

  });

  return uuid;

}




//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function Getdistance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function GetBrowser() {
  var _browser = "";
  var isIE = false;
  // Opera 8.0+

  // Internet Explorer 6-11
  if (/*@cc_on!@*/false || !!document.documentMode) {
    _browser = "Internet Explorer";
    isIE = true;
  }

  // Edge 20+
  if (!isIE && !!window.StyleMedia) {
    _browser = "Edge";
  }

  // Chrome 1+
  if (!!window.chrome && !!window.chrome.webstore || /chrome/.test(navigator.userAgent.toLowerCase())) {
    _browser = "Chrome";
  }

  if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification)) {
    _browser = "Safari";

  }
  return _browser;
}

 // For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}   
    
