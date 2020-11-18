var geolocation = {};
var incidents =[];
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
var speechSupported = true;
var crew = getParameterByName('crew'); 
var node = document.getElementById("btnMayDay");
var longpress = false;
var presstimer = null;
var longtarget = null;
var SimulationsJSON = null;
var SimResults ='';
var simID =getParameterByName('simID');
//* Setup Voice Recognition *//


try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
    console.log(e);
    speechSupported = false;
    $('.SpeechMessage').show();

}



//Check for long press on MayDay Button

var cancel = function(e) {
    if (presstimer !== null) {
        clearTimeout(presstimer);
        presstimer = null;
    }
    
    this.classList.remove("longpress");
};

var click = function(e) {
    if (presstimer !== null) {
        clearTimeout(presstimer);
        presstimer = null;
    }
    
    this.classList.remove("longpress");
    if (longpress) {
        return false;
    }
  
};

var start = function(e) {
    console.log(e);
    
    if (e.type === "click" && e.button !== 0) {
        return;
    }
    
    longpress = false;
    
    this.classList.add("longpress");
    this.classList.add("active");
    
    
    presstimer = setTimeout(function() {
        
        longpress = true;
        startRecording(true);
        
        
    }, 2000);
    
    return false;
};

node.addEventListener("mousedown", start);
node.addEventListener("touchstart", start);
node.addEventListener("click", click);
node.addEventListener("mouseout", cancel);
node.addEventListener("touchend", cancel);
node.addEventListener("touchleave", cancel);
node.addEventListener("touchcancel", cancel);






/*End Long Press */

//$('head').append('<script defer src="https://maps.googleapis.com/maps/api/js?key='+Config.googleMapsAPI+'"></script>');



 var iconBase = sessionStorage.getItem('rootURL') +'/images/';

 
//This stops the right click in Google Maps to only show the Simulation
window.onload = (function(){
    document.addEventListener("mouseup", function(evt){
        evt.preventDefault();
        evt.stopPropagation();
    });
    document.addEventListener("contextmenu", function(evt){
      evt.preventDefault();
      evt.stopPropagation();
  });
})();



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
    
 google.maps.event.addListener(map, 'rightclick', function (ev) {
     showAddSimulator(ev);
}); 
   
 getSimEntries();    
 showInitialTour();    
  
    
    
 //Check if the Crew is Set AND the Simulation and checkin Straight away
    
    
if(crew !== null && localStorage.getItem("rememberme")){
    hasCheckedIn =true;
    checkIn();
    setButtons();
    $('#btnLogin').hide();
    $('#btnMayDay').show();
    if(speechSupported){startRecording(false);}
    showLoggedInTour();
} 
    
//Load the Simulation on QR code     
    
 if(crew !== null && simID !== null){
    //Load the Simulation
    loadSimulation(SimResults[simID]);
    showLoggedInTour(); 
   
    
}    

if(crew !== null && simID !== null && localStorage.getItem("rememberme")){
    //Load the Simulation
    hasCheckedIn =true;
    checkIn();
    setButtons();
    $('#btnLogin').hide();
    $('#btnMayDay').show();
    
   loadSimulation(SimResults[simID]);
   showLoggedInTour();
    try{
    if(speechSupported){startRecording(false);}
    }catch(er){}
    
}    

    
  $("#loader").fadeOut("slow");    
  
    
});
    
//Load States
    

$.each(exDataSrc, function(key, value){

    $("#selectState").append('<a class="dropdown-item incidentData" href="#">'+key+'</a>');


})
    
    
 
    

//Load Config Data
    
$('#endpoint').val(Config.endpoint);
$('#authkey').val(Config.authkey);
$('#objectID').val(Config.objectID);
$('#rootURL').val(sessionStorage.getItem('rootURL'));
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
   if(speechSupported){startRecording(false);}else{ $('#btnMayDay').show();}
    hasCheckedIn = true;
   userOnly = false;    
   setButtons();
    var stmt = {"actor" : getActor(),
            "verb" : {"id" : "http://adlnet.gov/expapi/verbs/initialized",
                      "display" : {"en-US" : "Initialized"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/application",
                                "name": {
                                  "en-US": " the ESxAPI app at " + reverseLookUp(geolocation.lat, geolocation.long) +"(" + geolocation.lat +","+ geolocation.long +")",
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
    showLoggedInTour();
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
   
    $("#loader").show(); 
    checkIn();
   
   $("#loader").fadeOut("slow");   
    
})



    
    
//Update the map based on the test location
$('.incidentData').on('click',function(e){
    $("#loader").show();   
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
            
            
              
        var stmt = {"actor" : getActor(),
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/at",
                      "display" : {"en-US" : "was at"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/place",
                                "name": {
                                  "en-US": " " + reverseLookUp(geolocation.lat, geolocation.long) +" and was within " +Config.radius+"kms ( actual " + Math.round(distance) + " kms) of an incident at " + reverseLookUp(value.lat,value.long) +"("+ value.long +","+value.long+")"
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
    
    $("#loader").fadeOut("slow");                       
})

//Save the settings back to the server  
$('#btnsaveSettings').on('click',function(){
    
    setConfig();
     $('#mdlSettings').modal('hide');

    
})    
    
    
$('#btnSaveSim').on('click',function(){
    
       $('#Simmessage').hide();
    
if($('#incidentType').val()=='' || $('#simresources').val()=='' || $('#simradius').val()=='' || $('#incidentDescrip').val()==''){
    
    $('#Simmessage').empty().html('Please complete all fields').slideDown().delay(3000).slideUp();
    
    return;
    
} 
    
    
    setSimEntry();
    $('#mdladdSimulation').modal('hide');
    //Get the Simulations
    getSimEntries();
    
})    
 
    
//get all the users that haev checked in (looking at initislised verb) in last 24 hours    
$('#btnShowOthers').on('click',function(e){
    e.stopPropagation();
    e.preventDefault();
    $("#loader").show();   
    getAllUsers();
    $("#loader").fadeOut("slow");   
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
 $("#loader").show();      
simulateCheckin();    
 $("#loader").fadeOut("slow");      
    
})    
 
    
$(document).on('click','.simID',function(){
    
   $('#qrcode').empty();
   $('#qrcodeURL').empty().hide();
}) 
 
$(document).on('click','#btnSimCheckin',function(){
    
    //Loop through markers, if one is withing the radiuse, checkin!
    
    var Newlat = $(this).attr('data-lat');
    var Newlong = $(this).attr('data-long');
    
     $.each(incidents,function(key, value){$(this).hide();  
        
        var distance = Math.round(Getdistance(Newlat,Newlong,value.lat,value.long,'K'));
        //want to make sure the user has checkedin before sending this data. We need to know who it is, so a user MUST checkin

        //Add 10 for simulated buffer in icon    
        if(parseInt(distance) <= parseInt(Config.radius)){ 
        
        console.log('We are in range');  
        console.log('Distance:'+ distance);
        console.log('Radius:'+ Config.radius);
            
            
          
            
            
        var descObject = reverseLookUp(Newlat,Newlong) +" and was within " +Config.radius+"kms ( actual " + Math.round(distance) + " kms) of an incident at " + reverseLookUp(value.lat,value.long) +"("+ value.lat +","+value.long+")";    
          
        setTimeout(function(){console.log('dummy wait')},500);    
            
        var NewPosDesc = reverseLookUp(Newlat,Newlong) +",distanceToIncident"+ Math.round(Getdistance(Newlat,Newlong,value.lat, value.long,"K"))+"kms";    
            
        setTimeout(function(){console.log('dummy wait 2')},500);    
              
        var stmt = {"actor" : getActor(),
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/at",
                      "display" : {"en-US" : "was at"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/place",
                                "name": {
                                    "en-US": " " + descObject
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
                                "http://id.tincanapi.com/extension/latitude": Newlat,
                                "http://id.tincanapi.com/extension/longitude": Newlong,
                                "http://id.tincanapi.com/extension/measurement": distance,
                                "http://id.tincanapi.com/extension/geojson":
                               {
                                  "type": "FeatureCollection",
                                  "features": [
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ Newlat,Newlong ]
                                      },
                                      "properties": {
                                        "name":  NewPosDesc,
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
                                        "distanceFromUser": Math.round(Getdistance(Newlat,Newlong,value.lat, value.long,"K"))+"kms",
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
    
                
        $(this).hide();  
        }
          
        
    })
    
    $(this).hide();  
    
})    
 
$('#lat').val('');
$('#long').val('');
$('#incidentType').val('');
$('#location').val('');
$('#simresources').val('');
$('#simradius').val('50000');
$('#simtitle').val('');
$('#incidentDescrip').val('');
  
    
//Filter Simulations
    
$('#txt-search').keyup(function(){
//Clear content
    $('#qrcode').empty().hide();
    $('#qrcodeURL').empty().hide();
    getSimEntries();
    var searchField = $(this).val();
    if(searchField === '')  {
        $('#filter-records').html('');
        return;
    }

    var regex = new RegExp(searchField, "i");
    var output = '';
    var count = 1;
      $.each(SimResults, function(key, val){
          if(count > 5){
              return;
          }
        if ((val.title.search(regex) != -1) || (val.descrip.search(regex) != -1) || (val.location.search(regex) != -1)) {
          output += '<div class="row"><div class="col-md-4"><div class="form-group" ><label><h5>' + val.title+'</h5></label>';
          output += '<input type="radio" class="form-control simID"  name="simID" value="'+key+'"></div></div>' ;
          output += '<div class="col-md-8">' + val.location;
          output += '<p>' + val.descrip + '</p></div>'
          output += '</div></div><hr>';
          count++;
        }
      });
      $('#filter-records').html(output);
});
  
    
$('#btnGetQRCode').on('click',function(){
    
    makeQRCode();
    $('#qrcode').show();
    
})    
    
})



function makeQRCode () {	
    
    //Build the URL based on Sim Id and Crew
    var qrcode = new QRCode(document.getElementById("qrcode"), {
	width : 150,
	height : 150
    });
	var url = sessionStorage.getItem('rootURL')+'/index.html?simID='+ $('.simID:checked').val()+'&crew='+$('#crewName').val();
    $('#qrcodeURL').empty().html('<a href="'+url+'" target="_blank">'+url+'</a>').show();
	qrcode.makeCode(url);
}


function loadSimulation(simulation){
    
    
  
    
     $("#loader").show(); 
    //Clear markers

     var sim = simulation;
    
    //Clear circles    
    
Circle.setMap(null);
CirclesArray = [];  
    
//plot new location
    var SimLocation = []; 
 SimLocation = {lat: parseFloat(sim.lat), lng: parseFloat(sim.long)};
    
      var marker = new google.maps.Marker({position: SimLocation, map: map, icon: scaleImg(iconBase + 'mapbox-icon_sim.png'), title: "<b>"+sim.title+" at " +sim.location + "</b><br />"});
    markersArray.push(marker);
    
     const infowindow = new google.maps.InfoWindow({
                content: "<div style='text-align:left'><div style='font-size:14pt;font-weight:bold'>Simulated Incident<br/></div><p>"+sim.location+" <br>Incident:"+sim.incident+"<br>Resources:"+sim.resources+" <br>Details:"+sim.descrip+"</p><p>Created:"+sim.created+"</div></div>"    
              });
        InfoWindowArray.push(infowindow)
        infowindow.open(map, marker);
    
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
      center: SimLocation,
      radius: parseFloat(sim.radius) //in meters
    });
    
    CirclesArray.push(Circle);
    
    map.setOptions({ minZoom: 5, maxZoom: 15 });    
//update the circle and send simulated
  
    
//Zoom to location
map.setZoom(8);      // This will trigger a zoom_changed on the map
map.setCenter(new google.maps.LatLng(sim.lat, sim.long));

    
    //Check if the current location of the user is within the bounds of the simulaton
    
    
var distance = Getdistance(currentLocation.lat,currentLocation.lng,sim.lat,sim.long,'K');
        //want to make sure the user has checkedin before sending this data
            
        if(parseFloat(distance) <= parseFloat(sim.radius)){ 
            
            
              
        var stmt = {"actor" : getActor(),
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/start",
                      "display" : {"en-US" : "started"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://adlnet.gov/exapi/activties/simulation",
                                "name": {
                                  "en-US": " ESxAPI Simulation at " + reverseLookUp(currentLocation.lat, currentLocation.lng) +" and was within " +sim.radius/1000 +"kms ( actual " + Math.round(distance) + " kms) of an Simulated incident at " + reverseLookUp(sim.lat,sim.long) +"("+ sim.lat +","+sim.long+")"
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
                                "http://id.tincanapi.com/extension/latitude": currentLocation.lat,
                                "http://id.tincanapi.com/extension/longitude": currentLocation.lng,
                                "http://id.tincanapi.com/extension/measurement": distance,
                                "http://id.tincanapi.com/extension/geojson":
                               {
                                  "type": "FeatureCollection",
                                  "features": [
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ currentLocation.lat, currentLocation.lng ]
                                      },
                                      "properties": {
                                        "name": reverseLookUp(currentLocation.lat, currentLocation.lng),
                                        "distanceToIncident": Math.round(Getdistance(geolocation.lat, geolocation.long,sim.lat, sim.long,"K"))+"kms",  
                                      }
                                    },
                                    {
                                      "type": "Feature",
                                      "geometry": {
                                        "type": "Point",
                                        "coordinates": [ sim.lat, sim.long]
                                      },
                                        "properties": {
                                        "name": sim.incident + ' at ' + sim.location,
                                        "description": sim.descrip,
                                        "distanceFromUser": Math.round(Getdistance(currentLocation.lat, currentLocation.lng,sim.lat, sim.long,"K"))+"kms",
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
  // console.log(resp_obj);            
        }
    
    
    
    
    
    
$('#loader').hide();    
    
    
}  

//Execute a checkin
function checkIn(){
    $("#loader").show();      

     //Get current location
    getLocation();
    
    if(localStorage.getItem("rememberme")){
    email = localStorage.getItem('email');
    name = localStorage.getItem('name');
    }
    
    //get location
    //clear all
    deleteOverlays();
    Circle.setMap(null);
    
    var stmt = {"actor" : getActor(),
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/checkin",
                      "display" : {"en-US" : "checked in"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/place",
                                "name": {
                                  "en-US": " to " + reverseLookUp(geolocation.lat, geolocation.long) +"(" + geolocation.lat +","+ geolocation.long +")",
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
   
    
    message = "<b>"+name+"</b><br />"+ datetime;
            
             myLatLng = { lat: parseFloat(geolocation.lat), lng: parseFloat(geolocation.long) };
             const infowindow = new google.maps.InfoWindow({
                content: message
              });
         
           InfoWindowArray.push(infowindow);
          
             var marker = new google.maps.Marker({position: myLatLng, map: map,  icon: scaleImg(iconBase + 'mapbox-icon_you.png'), title: message});
              markersArray.push(marker);
       
             marker.addListener("click", () => {
           infowindow.open(map, marker);
                 
          });
            
    
    map.setOptions({ minZoom: 5, maxZoom: 15 });    
   Circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0,
      map: map,
     clickable: false,    
      center: myLatLng,
      radius: Config.radius * 1000 //in meters
    });
    
    CirclesArray.push(Circle);
    
//Zoom to location
map.setZoom(8);      // This will trigger a zoom_changed on the map
map.setCenter(new google.maps.LatLng(geolocation.lat, geolocation.long));
    
}; 

    
 

//This gets a list of users based on last checkin Verb

function getAllUsers(){
    
   var Last24Hours = new Date(Date.now() - 86400 * 1000).toISOString();
    
    
    //xapiResults
    var search = ADL.XAPIWrapper.searchParams();
    search['verb'] = "http://activitystrea.ms/schema/1.0/checkin";
    
    
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
           
        
        
          try {
            //thedate = new Date(theDate);	
           var message = Title + '<br/>' + ' on '+ theDate +'</br>' ;
           
           //Check if there are any images as attachments
           if(attachments){
                   message += "<br><button class='showPhotos btn btn-sm btn-primary' data-lat='"+value['lat']+"' data-long='"+value['long']+"'><i class='fa fa-camera'></i> View Photos</button>";
           
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
        
        
           	var message ='';
           
           //Check if there are any images as attachments
           if(value.attachments){
               message += "<br><button class='showPhotos btn btn-sm btn-primary' data-lat='"+value['lat']+"' data-long='"+value['long']+"'><i class='fa fa-camera'></i> View Photos</button>";
               
           } 
         
        var myLatLng ='';
        if(value['lat']){
            
            message = value['name'];
            
             myLatLng = { lat: parseFloat(value['lat']), lng: parseFloat(value['long']) };
             const infowindow = new google.maps.InfoWindow({
                content: message
              });
         
           InfoWindowArray.push(infowindow);
          
             var marker = new google.maps.Marker({position: myLatLng, map: map,  icon: scaleImg(iconBase + 'mapbox-icon_other.png'), title: message});
              markersArray.push(marker);
       
             marker.addListener("click", () => {
           infowindow.open(map, marker);
                 
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
if (InfoWindowArray) {
    for (y in InfoWindowArray) {
      InfoWindowArray[y].setMap(null);
    }
    InfoWindowArray.length = 0;
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
            if(parseInt(lat) && parseInt(long)){
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
         
            }
            
     }catch(err){
         console.log(err.message);
     }

        
    
    
}

function getIncidentData(dataObject){
    incidents = [];
   $.ajax({
     url: sessionStorage.getItem('rootURL')+'/getgeorss.php',
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


function showAddSimulator(ev){
    
    //Claer all fields
$('#lat').val('');
$('#long').val('');
$('#incidentType').val('');
$('#location').val('');
$('#simresources').val('1');
$('#simradius').val('50000');
$('#simtitle').val('');
$('#incidentDescrip').val('');
    
    
     var latlng = ev.latLng.toJSON()
            $(".modal-body #lat").val( latlng['lat'] );
            $(".modal-body #long").val( latlng['lng'] );
                var theLocation = reverseLookUp(latlng['lat'],latlng['lng']);
            $(".modal-body #location").val(theLocation);
            $(".modal-body .location").html(theLocation);
     
            $('#mdladdSimulation').modal('show')
    
    
}
    

function getSimEntries(){
     $.ajax({
             async: false,
             type: 'GET',
             dataType: 'json',
             data: {'action':'get'},
             url: sessionStorage.getItem('rootURL')+'/sim.php',
             success: function(result){
                    SimResults = result;
                    
              }
        }) 
    
    
    
}

function setSimEntry(){
       
    
    
    
var data = { 'lat':$('#lat').val(),
'long':$('#long').val(),
'incidentType':$('#incidentType').val(),
'location':$('#location').val(),
'simresources':$('#simresources').val(),
'simradius':$('#simradius').val(),
'simtitle': $('#simtitle').val(),
'action':'set',
'incidentDescrip':$('#incidentDescrip').val()
};
   
    $.ajax({
             async: false,
             type: 'GET',
             dataType: 'json',
             data: data,
             url: sessionStorage.getItem('rootURL')+'/sim.php',
             success: function(result){
                     //saved so update the Config details
                 
                     Config = result;
                 
              }
        }) 
    
    
    
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
             url: sessionStorage.getItem('rootURL')+'/config.php',
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
             url: sessionStorage.getItem('rootURL')+'/config.php',
             success: function(result){
                     Config = result;
    
              }
        })
    


    
}




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
$("#showMayDay").show();    
    
}
    
if(userOnly && !hasCheckedIn){
    
  $('#btnToggleCircle').show();    
  $('#dropdownMenuButton').show();   
  $('#buttons').show();    
  
   
}
    
    
    
    
    
}

function getActor(){
    
  var actor = {"objectType":"Agent", "mbox" : "mailto:"+email,"name": name};
   
    if(crew !== null){
        actor = {
                 "objectType" : "Group",
                    "name": 'Crew   ' + crew,
                 "member":[
                     {
                "objectType": "Agent",
                "mbox" : "mailto:"+email,
                 "name": name,     
                     }
                 ]};
    }
    
    return actor;
    
    
    
}
    
    

function toggleCircles(){
    
Circle.setMap(Circle.getMap() ? null : map);
        
}
 
//Simulate the user checkin
function simulateCheckin(){
    
    
 //get a random state from exData and plot
const values = Object.values(exDataSrc)
const randomData = values[parseInt(Math.random() * values.length)]    
   
 incidents = getIncidentData(randomData);
//check if there are any incidents and if not, try again
  
if(incidents.length <= 0){ 
    console.log('No incidents found, trying again');
    simulateCheckin();
}   

//Capture that the user ran a simulation
    
     var stmt = {"actor" : getActor(),
            "verb" : {"id" : "http://activitystrea.ms/schema/1.0/start",
                      "display" : {"en-US" : "started"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://adlnet.gov/exapi/activties/simulation",
                                "name": {
                                    "en-US": " ESxAPI Simulation"
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
    
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);
    
    
//remove the current location and circle    
//first marker is ALWAYS the checkin user
  deleteOverlays();   

//Clear circles    
Circle.setMap(null);
CirclesArray = [];    

    
    
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
                content: "<div style='text-align:center'><div style='font-size:14pt;font-weight:bold'>You are now at <br/>"+reverseLookUp(NewPosition["latitude"],NewPosition["longitude"])+"</div><br/><button id='btnSimCheckin' class='btn btn-sml btn-info' data-lat='"+NewPosition["latitude"]+"' data-long='"+NewPosition["longitude"]+"'><i class='fa fa-crosshairs'></i> 'Checkin' here</button></div>",
              });
        InfoWindowArray.push(infowindow);
            infowindow.open(map, marker);
    
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

   return;
            
        
    }
     
  
function startRecording(byPass) {

    if(byPass){
        
        
        var LocationMD = reverseLookUp(geolocation.lat, geolocation.long);
                      
                      var stmt = {"actor" : getActor(),
            "verb" : {"id" : "https://w3id.org/xapi/dod-isd/verbs/communicated",
                      "display" : {"en-US" : "communicated"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/alert",
                                "name": {
                                  "en-US": " MAYDAY MAYDAY MAYDAY - from  " + reverseLookUp(geolocation.lat, geolocation.long) +"(" + geolocation.lat +","+ geolocation.long +")",
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
                                        "name": LocationMD
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
                        
                
   
   //Send the Statement to the LRS
   console.log(stmt);            
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);      
      //Plot this on the map as a May Day
                      
        var marker = new google.maps.Marker({position: currentLocation, map: map, icon: scaleImg(iconBase + 'mapbox-icon_mayday.png'), title: name + " sent a MAYDAY request from " + LocationMD});
        markersArray.push(marker);

        infowindow = new google.maps.InfoWindow({
        content: name + " sent a MAYDAY call from " + LocationMD + ". <br/>Latitiude: " + geolocation.lat +"<br/>Longitude: "+ geolocation.long + " <br>Date and Time: " + new Date().today() + " @ " + new Date().timeNow()
        });
        InfoWindowArray.push(infowindow);


        marker.addListener("click", () => {
        infowindow.open(map, marker);
        });   
   
            return;
    
        
        }
        
        
        
        
        
    
    
    
    
    recognition.onstart = function() {
        setTimeout(() => {
            console.log("Started Recorder");
        }, 1000);
    }
    recognition.onresult = function(event) {
        
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var text = event.results[i][0].transcript.toLowerCase();
                  if(text.indexOf('mayday mayday mayday') !==-1 && event.results[i].isFinal)   {
        
                      var LocationMD = reverseLookUp(geolocation.lat, geolocation.long);
                      
                      var stmt = {"actor" : getActor(),
            "verb" : {"id" : "https://w3id.org/xapi/dod-isd/verbs/communicated",
                      "display" : {"en-US" : "communicated"}},
            "object" : { "id": Config.objectID,
                          "objectType": "Activity",
                              "definition": {
                                "type": "http://activitystrea.ms/schema/1.0/alert",
                                "name": {
                                  "en-US": "MAYDAY MAYDAY MAYDAY - from  " + reverseLookUp(geolocation.lat, geolocation.long) +"(" + geolocation.lat +","+ geolocation.long +")",
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
                                        "name": LocationMD
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
                        
                
   
   //Send the Statement to the LRS
   console.log(stmt);            
   var resp_obj = ADL.XAPIWrapper.sendStatement(stmt);      
      //Plot this on the map as a May Day
                      
        var marker = new google.maps.Marker({position: currentLocation, map: map, icon: scaleImg(iconBase + 'mapbox-icon_mayday.png'), title: name + " sent a MAYDAY request from " + LocationMD});
        markersArray.push(marker);

        infowindow = new google.maps.InfoWindow({
        content: name + " sent a MAYDAY call from " + LocationMD + ". <br/>Latitiude: " + geolocation.lat +"<br/>Longitude: "+ geolocation.long + " <br>Date and Time: " + new Date().today() + " @ " + new Date().timeNow()
        });
        InfoWindowArray.push(infowindow);


        marker.addListener("click", () => {
        infowindow.open(map, marker);
        });   
   
        } else {
          //console.log(event.results[i][0].transcript);
        }
            
        }
    }
    recognition.start();

        recognition.onend = function() {
        setTimeout(() => {
            console.log("Recording Has Stopped");
        }, 10000);
       
    }
    
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

    
           
var addressDetails ='Unkown location';

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
                        addressDetails = results.results[0].address_components[0].long_name + ', ' + results.results[0].address_components[1].long_name ;     
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




    
