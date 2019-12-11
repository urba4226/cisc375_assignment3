var app;
var api;

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
    LoadNeighborhoods(crime_api_url);
    LoadIncidents(crime_api_url);
    CrimeSearch(crime_api_url);

    app = new Vue({
        el: "#app",
        data: {
            //api_url: "",
            search_results: [],
            neighborhoods: [],
            incidents: [],
            selectedNeighborhoods: [],
            selectedIncidents: [],
            start_date: "",
            end_date: "",
            start_time: "",
            end_time: ""
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

function AddCrime(case_num)
{
    console.log("case_num: " + case_num);
}   //AddCrime
