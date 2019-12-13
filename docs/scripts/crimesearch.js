var app;
var api;
var mymap;

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

function moveMap()
{
	var input;
	input = document.getElementById('myInput');
	document.getElementById('myInput')="";
	alert(1);
	input = input.split(",")
	map.setView(new L.LatLng(input[0],input[1]), 12);
}

function Init(crime_api_url)
{
    api = crime_api_url;
    mymap = L.map('mapid').setView([44.95, -93.09], 11);
    var conway = L.marker([44.9509, -93.02], 13).addTo(mymap);
    var east_side = L.marker([44.972, -93.09], 13).addTo(mymap);
    var west_side = L.marker([42.926, -93.12], 13).addTo(mymap);
    var dayton = L.marker([44.954, -93.061], 13).addTo(mymap);
    var payne = L.marker([44.9765, -93.066], 13).addTo(mymap);
    var north_end = L.marker([44.9765, -93.105], 13).addTo(mymap);
    var frogtown = L.marker([44.9604, -93.123], 13).addTo(mymap);
    var summit_university = L.marker([44.9503, -93.127], 13).addTo(mymap);
    var west_seventh = L.marker([44.9259, -93.1287], 13).addTo(mymap);
    var como = L.marker([44.9732, -93.1361], 13).addTo(mymap);
    var hamline = L.marker([44.9439, -93.1507], 13).addTo(mymap);
    var st_anthony = L.marker([44.973, -93.197], 13).addTo(mymap);
    var union_park = L.marker([44.9475, -93.1885], 13).addTo(mymap);
    var macalaster = L.marker([44.9325, -93.1676], 13).addTo(mymap);
    var highland = L.marker([44.9113, -93.1773], 13).addTo(mymap);
    var summit_hill = L.marker([44.9368, -93.138], 13).addTo(mymap);
    var capitol_river = L.marker([44.9587, -93.1034], 13).addTo(mymap);
    
    mymap.setMaxBounds(mymap.getBounds());

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
    console.log(request.url);
    $.ajax(request);
}   //CrimeSearch

function CrimeData(data)
{
    app.search_results = data;
    console.log(data);
}   //CrimeData

function AddCrime(address)
{
    console.log("address: " + address);
}   //AddCrime

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
    console.log(address);
    let request = {
        url: "https://nominatim.openstreetmap.org/search?format=json&limit=1&state=Minnesota&city=Saint Paul&street=" + address,
        dataType: "json",
        success: LocationData
    };  //request
    $.ajax(request);
}   //AddressSearch

function LocationData(data)
{
    console.log("Lat: " + data[0].lat);
    console.log("Lon: " + data[0].lon);
    console.log(data);
}   //LocationData

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

function MapMoved(event)
{
    //Set variables for center lat and long:
    app.center_long = mymap.getCenter().lng;
    app.center_lat = mymap.getCenter().lat;

    //Set variables for Northwest/Southeast lat and long:
    let bounds = mymap.getBounds();
    app.west_long = bounds.getNorthWest().lng;
    app.north_lat = bounds.getNorthWest().lat;
    app.east_long = bounds.getSouthEast().lng;
    app.south_lat = bounds.getSouthEast().lat;
    console.log("Center: " + mymap.getCenter());
    console.log("Northwest: " + bounds.getNorthWest());
    console.log("SouthEast: " + bounds.getSouthEast());
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
