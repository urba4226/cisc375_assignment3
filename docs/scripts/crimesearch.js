var app;
var auth_data = {};

function Init()
{
    /*
    // Spotify authentication
    if (!window.location.hash || window.location.hash.length < 15 || window.location.hash.substring(0, 14) !== "#access_token=")
    {
        let spotify_client_id = "01d2501b06fc4d4f8e27eaaead009c0e";
        
        window.location = "https://accounts.spotify.com/authorize?client_id=" + spotify_client_id + 
                          "&response_type=token&redirect_uri=" + window.location.origin + "/index.html" +
                          "&state=1234";
    }   //if

    // Actual app, once authenticated
    let i, key_val;
    let auth_array = window.location.hash.substring(1).split("&");
    for (i = 0; i < auth_array.length; i++)
    {
        key_val = auth_array[i].split("=");
        if (key_val.length === 2)
        {
            auth_data[key_val[0]] = key_val[1];
        }   //if
    }   //for
    */

    loadNeighborhoods();

    app = new Vue({
        el: "#app",
        data: {
            search_results: [],
            neighborhoods: []
        }  //data
        /*
        computed: {
            input_placeholder: function() {
                if (this.spotify_type[0] === "a")
                    return "Search for an " + this.spotify_type;
                return "Search for a " + this.spotify_type;
            }   //input_placeholder
        }   //computed
        */
    }); //Vue
}   //init

function loadNeighborhoods()
{
    let request = {
        url: "http://cisc-dean.stthomas.edu:8022/neighborhoods",
        dataType: "json",
        success: NeighborhoodData
    };  //request
    $.ajax(request);
}   //loadNeighborhoods

function NeighborhoodData(data)
{
    app.neighborhoods = data;
    console.log(data);
}   //CrimeData

function CrimeSearch(event)
{
    let request = {
        url: "http://cisc-dean.stthomas.edu:8022/incidents?start_date=2019-10-01&end_date=2019-10-31",
        dataType: "json",
        success: CrimeData
    };  //request
    $.ajax(request);
}   //CrimeSearch

function CrimeData(data)
{
    app.search_results = data;
    console.log(data);
}   //CrimeData
