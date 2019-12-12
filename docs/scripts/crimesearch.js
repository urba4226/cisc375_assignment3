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

function Init(crime_api_url)
{
    api = crime_api_url;
    mymap = L.map('mapid').setView([44.95, -93.09], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoidHVja2VydTE2Njg3IiwiYSI6ImNrNDFzczRubzA0azkzbHA1dzB6YWRoa3kifQ.K159LksBQPayp26P3E1ppQ'
    }).addTo(mymap);
    mymap.on('mouseup', MapRelease);

    //Stuff needed for map:
    //getNorthWest()
        //long > getNorthWest().lng
        //lat < getNorthWest().lat
    //getSouthEast()
        //long < getSouthEast().lng
        //lat > getSouthEast().lat
    //getCenter()
        //Returns lat/long of center
    //mouseup event
        //Fired when user releases mouse button on map

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
            end_time: "23:59:59"
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

function MapRelease(event)
{
    console.log(event.latlng);
    console.log("Lat: " + event.latlng.lat);
    console.log("Lng: " + event.latlng.lng);
}   //MapRelease