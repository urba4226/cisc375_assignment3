var app;
var api;
var mymap;

var conway;
var east_side;
var west_side;
var dayton;
var payne;
var north_end;
var frogtown;
var summit_university;
var west_seventh;
var como;
var hamline;
var st_anthony;
var union_park;
var macalaster;
var highland;
var summit_hill;
var capitol_river;

function Prompt() {
    $("#dialog-form").dialog({
        autoOpen: true,
        modal: true,
        width: "360px",
        buttons: {
            "Ok": function() {
                var prompt_input = $("#prompt_input");
                Init(prompt_input.val());
                $(this).dialog("close");
            },  //ok
            "Cancel": function() {
                $(this).dialog("close");
            }   //cancel
        }   //buttons
    }); //dialog
}   //Prompt



function Init(crime_api_url)
{
    api = crime_api_url;

    mymap = L.map('mapid').setView([44.95, -93.08931335449219], 11);
    conway = L.marker([44.9509, -93.02], 13).addTo(mymap);
    east_side = L.marker([44.972, -93.09], 13).addTo(mymap);
    west_side = L.marker([42.926, -93.12], 13).addTo(mymap);
    dayton = L.marker([44.954, -93.061], 13).addTo(mymap);
    payne = L.marker([44.9765, -93.066], 13).addTo(mymap);
    north_end = L.marker([44.9765, -93.105], 13).addTo(mymap);
    frogtown = L.marker([44.9604, -93.123], 13).addTo(mymap);
    summit_university = L.marker([44.9503, -93.127], 13).addTo(mymap);
    west_seventh = L.marker([44.9259, -93.1287], 13).addTo(mymap);
    como = L.marker([44.9732, -93.1361], 13).addTo(mymap);
    hamline = L.marker([44.9439, -93.1507], 13).addTo(mymap);
    st_anthony = L.marker([44.973, -93.197], 13).addTo(mymap);
    union_park = L.marker([44.9475, -93.1885], 13).addTo(mymap);
    macalaster = L.marker([44.9325, -93.1676], 13).addTo(mymap);
    highland = L.marker([44.9113, -93.1773], 13).addTo(mymap);
    summit_hill = L.marker([44.9368, -93.138], 13).addTo(mymap);
    capitol_river = L.marker([44.9587, -93.1034], 13).addTo(mymap);

    mymap.setMaxBounds([
            //Northeast:
            [45.0474, -92.8833],
            //Southwest:
            [44.854, -93.2953]]);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 11,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoidHVja2VydTE2Njg3IiwiYSI6ImNrNDFzczRubzA0azkzbHA1dzB6YWRoa3kifQ.K159LksBQPayp26P3E1ppQ'
    }).addTo(mymap);
    mymap.on('moveend', MapMoved);

    LoadNeighborhoods(crime_api_url);
    LoadIncidents(crime_api_url);
    CrimeSearch(crime_api_url);

    app = new Vue({
        el: "#app",
        data: {
            search_results: [],
            neighborhoods: [],
            incidents: [],
            selectedNeighborhoods: [],
            selectedIncidents: [],
            start_date: "",
            end_date: "",
            start_time: "00:00:00",
            end_time: "23:59:59",
            center_long: "-93.09",
            center_lat: "44.95",
            west_long: "-93.296",
            north_lat: "45.047",
            east_long: "-92.884",
            south_lat: "44.853",
            neighborhood_coordinates: {
                "Conway/Battlecreek/Highwood": [44.9509, -93.02],
                "Greater East Side": [44.972, -93.09],
                "West Side": [42.926, -93.12],
                "Dayton's Bluff": [44.954, -93.061],
                "Payne/Phalen": [44.9765, -93.066],
                "North End": [44.9765, -93.105],
                "Thomas/Dale(Frogtown)": [44.9604, -93.123],
                "Summit/University": [44.9503, -93.127],
                "West Seventh": [44.9259, -93.1287],
                "Como": [44.9732, -93.1361],
                "Hamline/Midway": [44.9439, -93.1507],
                "St. Anthony": [44.973, -93.197],
                "Union Park": [44.9475, -93.1885],
                "Macalester-Groveland": [44.9325, -93.1676],
                "Highland": [44.9113, -93.1773],
                "Summit Hill": [44.9368, -93.138],
                "Capitol River": [44.9587, -93.1034]
            }   //neighborhood_coordinates
        }  //data
    }); //Vue
}   //init

function LoadNeighborhoods(api_url)
{
    let request = {
        url: api_url + "/neighborhoods",
        dataType: "json",
        success: NeighborhoodData
    };  //request
    $.ajax(request);
}   //loadNeighborhoods

function NeighborhoodData(data)
{
    app.neighborhoods = data;
    console.log(data);
}   //NeighborhoodData

function LoadIncidents(api_url)
{
    let request = {
        url: api_url + "/codes",
        dataType: "json",
        success: IncidentData
    };  //request
    $.ajax(request);
}   //loadIncidents

function IncidentData(data)
{
    app.incidents = data;
    console.log(data);
}   //IncidentData

function CrimeSearch(api_url)
{
    let request = {
        url: api_url + "/incidents?start_date=2019-10-01&end_date=2019-10-31",
        dataType: "json",
        success: CrimeData
    };  //request
    $.ajax(request);
}   //CrimeSearch


function FilteredSearch(neighborhoods, incidents, start_date, end_date)
{
    let first = true;
    let neighborhoods_filter = "";
    let incidents_filter = "";
    let start_date_filter = "";
    let end_date_filter = "";

    //Handler for if neighborhoods is filtered:
    if (neighborhoods.length > 0)
    {
        if (first)
        {
            first = false;
            neighborhoods_filter = "?id=";
        }   //if
        else
        {
            neighborhoods_filter = "&id=";
        }
        neighborhoods_filter = neighborhoods_filter + neighborhoods[0];
        for (let i=1; i<neighborhoods.length; i++)
        {
            neighborhoods_filter = neighborhoods_filter + "," + neighborhoods[i];
        }   //for
    }   //if

    //Handler for if incidents is filtered:
    if (incidents.length > 0)
    {
        if (first)
        {
            first = false;
            incidents_filter = "?code=";
        }   //if
        else
        {
            incidents_filter = "&code=";
        }   //else
        incidents_filter = incidents_filter + incidents[0];
        for (let i=1; i<incidents.length; i++)
        {
            incidents_filter = incidents_filter + "," + incidents[i];
        }   //for
    }   //if

    //Handler for if start_date is set:
    if (start_date.length > 0)
    {
        if (first)
        {
            first = false;
            start_date_filter = "?start_date=";
        }   //if
        else
        {
            start_date_filter = "&start_date=";
        }   //else
        start_date_filter = start_date_filter + start_date;
    }   //if

    //Handler for if end_date is set:
    if (end_date.length > 0)
    {
        if (first)
        {
            first = false;
            end_date_filter = "?end_date=";
        }   //if
        else
        {
            end_date_filter = "&end_date=";
        }   //else
        end_date_filter = end_date_filter + end_date;
    }   //if

    let request = {
        url: api + "/incidents" + neighborhoods_filter + incidents_filter + start_date_filter + end_date_filter,
        dataType: "json",
        success: CrimeData
    };  //request
    $.ajax(request);
}   //CrimeSearch

function CrimeData(data)
{
    app.search_results = data;
    updateMarkers();
    console.log(data);
}   //CrimeData

function AddCrimeMarker(address, date, time, incident)
{
    let parsed = ParseAddress(address);
    let request = {
        url: "https://nominatim.openstreetmap.org/search?format=json&limit=1&state=Minnesota&city=Saint Paul&street=" + parsed,
        dataType: "json",
        success: (data)=>
            {
                if(data.length > 0)
                {
                    var paragraph = document.createElement("p");
                    paragraph.innerHTML="Date: " + date + "<br>Time: " + time + "<br>Incident: " + incident;
                    var button = document.createElement("button");
                    var div = document.createElement("div");
                    div.appendChild(paragraph);
                    div.appendChild(button);
                    button.textContent="Remove Marker";
                    var crimeMarker = L.marker([data[0].lat, data[0].lon], 13).addTo(mymap);
                    crimeMarker.bindPopup(div).openPopup();
                    button.onclick=function (){
                        mymap.removeLayer(crimeMarker);
                    };
                }   //if
                else
                {
                    alert("Nominatim could not find crime location");
                }
            }
    };  //request
    $.ajax(request);
    //marker.bindPopup(popupContent).openPopup();
    //map.removeLayer(theMarker);
    console.log("address: " + address);
}   //AddCrimeMarker

function ParseAddress(address)
{
    let split_string= address.split(" ");
    if (split_string[0].charAt(0) >= 0 && split_string[0].charAt(0) <= 9)
    {
        split_string[0] = split_string[0].replace("X", "0");
    }   //if
    return split_string.join(" ");
}   //ParseAddress

function AddressSearch(address)
{
    //console.log(address);
    let request = {
        url: "https://nominatim.openstreetmap.org/search?format=json&limit=1&state=Minnesota&city=Saint Paul&street=" + address,
        dataType: "json",
        success: LocationData
    };  //request
    $.ajax(request);
}   //AddressSearch

function CrimeType(code)
{
    if ((code<300) || (code>=400 && code<500) || (code>=800 && code<1000))
    {
        return "table-danger";
    }   //if
    else if ((code>=300 && code<400) || (code>=500 && code<800) || (code>=1400 && code<1500))
    {
        return "table-warning";
    }   //else if
    else
    {
        return "";
    }   //else
}   //CrimeType

function MoveMap()
{
    var input;
    input = document.getElementById('myInput').value;
    document.getElementById('myInput').value="";
    document.getElementById('myInput').placeholder=app.center_lat + ", " + app.center_long;
    input = input.split(",");
    try
    {
        mymap.setView(new L.LatLng(input[0],input[1]), 14);
    }   //try
    catch(error)
    {
        try
        {
            let request = {
                url: "https://nominatim.openstreetmap.org/search?format=json&limit=1&state=Minnesota&street=" + input,
                dataType: "json",
                success: (data)=>
                {
                    if(data.length > 0)
                    {
                        console.log(data);
                        mymap.setView(new L.LatLng(data[0].lat,data[0].lon), 14);
                    }   //if
                    else
                    {
                        alert("Could not find address");
                    }   //else
                }   //success
            }   //request
            $.ajax(request);
        }   //try
        catch(error)
        {
            alert("Invalid address format");
        }
    }   //catch
}

function MapMoved(event)
{
    //Set variables for center lat and long:
    app.center_long = mymap.getCenter().lng;
    app.center_lat = mymap.getCenter().lat;

    //Set variables for Northwest/Southeast lat and long:
    let bounds = mymap.getBounds();
    app.west_long = bounds.getSouthWest().lng;
    app.north_lat = bounds.getNorthEast().lat;
    app.east_long = bounds.getNorthEast().lng;
    app.south_lat = bounds.getSouthWest().lat;

    //Update Search bar placeholder: 
    document.getElementById('myInput').placeholder=app.center_lat + ", " + app.center_long;
}   //MapRelease

function CheckBounds(coords)
{
    if (coords[1]>app.west_long && coords[1]<app.east_long && coords[0]>app.south_lat && coords[0]<app.north_lat)
    {
        return true;
    }   //if
    else
    {
        return false;
    }   //else
}   //CheckBounds

function CenterToString()
{
    let output = "";
    output = output + app.center_lat + "," + app.center_long;
    return output;
}   //CenterToString

function updateMarkers()
{
    var counts = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    for(crime in app.search_results)
    {
        if(app.search_results[crime].time >= app.start_time && app.search_results[crime].time <= app.end_time)
        {
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Conway/Battlecreek/Highwood")
            {
                counts[0] = counts[0] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Dayton's Bluff")
            {
                counts[1] = counts[1] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "North End")
            {
                counts[2] = counts[2] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Hamline/Midway")
            {
                counts[3] = counts[3] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Capitol River")
            {
                counts[4] = counts[4] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Union Park")
            {
                counts[5] = counts[5] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Thomas/Dale(Frogtown)")
            {
                counts[6] = counts[6] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Macalester-Groveland")
            {
                counts[7] = counts[7] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Como")
            {
                counts[8] = counts[8] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Highland")
            {
                counts[9] = counts[9] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Payne/Phalen")
            {
                counts[10] = counts[10] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Summit Hill")
            {
                counts[11] = counts[11] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "West Seventh")
            {
                counts[12] = counts[12] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "St. Anthony")
            {
                counts[13] = counts[13] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Greater East Side")
            {
                counts[14] = counts[14] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "West Side")
            {
                counts[15] = counts[15] + 1;
            }
            if(app.neighborhoods["N" + app.search_results[crime].neighborhood_number] == "Summit/University")
            {
                counts[16] = counts[16] + 1;
            }
        }
    }

    var paragraph = document.createElement("p");
    paragraph.innerHTML="Conway/Battlecreek/Highwood<br>Total Crimes: " + counts[0];
    conway.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Dayton's Bluff<br>Total Crimes: " + counts[1];
    dayton.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="North End<br>Total Crimes: " + counts[2];
    north_end.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Hamline/Midway<br>Total Crimes: " + counts[3];
    hamline.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Capitol River<br>Total Crimes: " + counts[4];
    capitol_river.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Union Park<br>Total Crimes: " + counts[5];
    union_park.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Thomas/Dale(Frogtown)<br>Total Crimes: " + counts[6];
    frogtown.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Macalester-Groveland<br>Total Crimes: " + counts[7];
    macalaster.bindPopup(paragraph);

    var paragraph = document.createElement("p");
    paragraph.innerHTML="Como<br>Total Crimes: " + counts[8];
    como.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Highland<br>Total Crimes: " + counts[9];
    highland.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Payne/Phalen<br>Total Crimes: " + counts[10];
    payne.bindPopup(paragraph);

    var paragraph = document.createElement("p");
    paragraph.innerHTML="Summit Hill<br>Total Crimes: " + counts[11];
    summit_hill.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="West Seventh<br>Total Crimes: " + counts[12];
    west_seventh.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="St. Anthony<br>Total Crimes: " + counts[13];
    st_anthony.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Greater East Side<br>Total Crimes: " + counts[14];
    east_side.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="West Side<br>Total Crimes: " + counts[15];
    west_side.bindPopup(paragraph);
    
    var paragraph = document.createElement("p");
    paragraph.innerHTML="Summit/University<br>Total Crimes: " + counts[16];
    summit_university.bindPopup(paragraph);   
}   //updateMarkers()