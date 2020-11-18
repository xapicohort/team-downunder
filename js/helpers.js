/***** Helper Functions *****/





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


function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

 // For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}  



/* this is an assumption based on the name passed and is not always correct */
function showInitialTour(){
// Instance the tour
	
var tour = new Tour({
   container: "body",
    steps: [
  {
    element: "#btnLogin",
    title: "Start Here",
    content: "Checkin or just Show the map. This is used to know who you are and is captured as the ACTOR in the xAPI. When selecting 'Just show me the map' this does not send any xAPI data"
  },
	  {
	element: "#ddSim",
    title: "Generate QR Code",
    content: "Generate a QR Code and link to send a Simulation and Crew."
  },
	  {
	element: "#map",
    title: "Google Maps",
    content: "Where it all happens! click on any marker to see details. Click away to hide. <p>Right click on the map to bring up a new window to create a new Simulation based on where you clicked."
  }
	
]});

// Initialize the tour
tour.init();

// Start the tour
tour.start(true);

}
function showLoggedInTour(){
// Instance the tour
	
var tourLogged = new Tour({
    container: "body",
    steps: [
  {
    element: "#btnMayDay",
    title: "Mayday Button",
    content: "Press and hold for 2 SECONDS. After 2 seconds, a MayDay xAPI statement is sent to the LRS capturing your location"
  },{
    element: "#btnLogin",
    title: "Start Here",
    content: "Checkin or just Show the map. This is used to know who you are and is captured as the ACTOR in the xAPI. When selecting 'Just show me the map' this does not send any xAPI data"
  },
	  {
	element: "#ddSim",
    title: "Generate QR Code",
    content: "Generate a QR Code and link to send a Simulation and Crew."
  },
	  {
	element: "#map",
    title: "Google Maps",
    content: "Where it all happens! click on any marker to see details. Click away to hide. <p>Right click on the map to bring up a new window to create a new Simulation based on where you clicked."
  },
	  {
	element: "#btnCheckIn",
    title: "Checkin",
    content: "Send a Manual checkin from where you are"
  }
   ,
	  {
	element: "#btnSimulateCheckIn",
    title: "Simulate Checkin",
    content: "This will run a simulation against the all the live incidents and drop you near an incident. Click the 'Check in' to send the xAPI"
  }
   ,
	  {
	element: "#btnShowOthers",
    title: "Show Other Users",
    content: "PLot on the map all the users that have checked in over the last 24 hours"
  }
   ,
	  {
	element: "#btnShowDashboard",
    title: "Show Dashboard",
    content: "Launch a simple xAPI Dashboard to show the last 100 statements sent (in a new window)"
  }
   ,
	  {
	element: "#dropdownMenuButton",
    title: "Available Live Incidents",
    content: "For Australia only, select a state to plot live incidents on the map"
  }
   ,
	  {
	element: "#btnSettings",
    title: "Settings",
    content: "Update settings of the App"
  }
      ,
	  {
	element: "#btnToggleCircle",
    title: "Toggle Radius Circle",
    content: "Toggles teh Radious circle (as set by the settings or the Simulation) on the map"
  },
	  {
	element: "#btnAbout",
    title: "About the App",
    content: "All about the app!"
  }
      
	
]});

// Initialize the tour
tourLogged.init();

// Start the tour
tourLogged.start(true);

}