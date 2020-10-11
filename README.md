# team-downunder
The Australian xAPI Team - creating an application to marry emergency services real-time data with GeoLocation check-ins in xAPI. Creating a central repository of users where data analytics can be used to fill gaps in training based on incidents

This application uses Google Maps to plot a location of where the user is and sends xAPI data to an LRS. 

In the settings, a radius can be set so when a user selects a State from the dropdown list, if the checkin is within that radius an xAPI Statement is generated and sent to the LRS.

The xAPI Data structure uses the following:

##Verbs


http://adlnet.gov/expapi/verbs/initialized when the app starts
http://activitystrea.ms/schema/1.0/at to capture where the user is At when compared to the incident data.
http://activitystrea.ms/schema/1.0/checkin when a user clicks on Checkin


##Extentions
Browser

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
GeoJSON and Location

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
