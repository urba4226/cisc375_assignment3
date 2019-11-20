// Built-in Node.js modules
var fs = require('fs');
var path = require('path');

// NPM modules
var express = require('express');
var bodyParser = require('body-parser');
var js2xmlparser = require('js2xmlparser');
var sqlite3 = require('sqlite3');

var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

var app = express();
var port = 8000;

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }   //if
    else {
        console.log('Now connected to ' + db_filename);
    }   //else
});

//Start server 
var server = app.listen(port);
console.log('Now listening on port ' + port);

//GET request handler for codes
app.get('/codes', (req, res) => 
{
	//let query = "SELECT * FROM Codes ORDER BY code";
    let query = "SELECT * FROM Codes";
    let parameters = [];

    //Handler for code:
    if (req.query.code)
    {
        //Put list of codes into array:
        let codes = req.query.code.split(",");
        query = query + " WHERE (code = ?";
        parameters.push(codes[0]);
        for (let j = 1; j<codes.length; j++)
        {
            query = query + " OR code = ?";
            parameters.push(codes[j]);
        }   //for
        query = query + ")";
    }   //if

    query = query + " ORDER BY code";

    db.all(query, parameters, (err, rows) =>
    {
        if (err)
        {
            res.status(500).send('Error: could not retrieve data from database');
        }   //if
        else
        {
        	//Build JSON object:
        	let response = {};

			for (let i=0; i<rows.length; i++)
        	{
        		response['C' + rows[i].code] = rows[i].incident_type;
        	}	//for
        	
        	//Handler for format option:
			if (req.query.format === 'json')
			{
				res.type('json').send(response);
			}	//if
			else if (req.query.format === 'xml')
			{
				let xml = js2xmlparser.parse("codes", response);
				res.type('xml').send(xml);
			}	//else if
			else
			{
				res.type('json').send(response);
			}	//else
        }	//else
    });	//db.all
});	//app.get

//GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => 
{
    let query = "SELECT * FROM Neighborhoods";
    let parameters = [];

    //Handler for id:
    if (req.query.id)
    {
        //Put list of ids into array:
        let ids = req.query.id.split(",");
        query = query + " WHERE (neighborhood_number = ?";
        parameters.push(ids[0]);
        for (let j = 1; j<ids.length; j++)
        {
            query = query + " OR neighborhood_number = ?";
            parameters.push(ids[j]);
        }   //for
        query = query + ")";
    }   //if

    query = query + " ORDER BY neighborhood_number";

    db.all(query, parameters, (err, rows) =>
    {
        if (err)
        {
            res.status(500).send('Error: could not retrieve data from database');
        }   //if
        else
        {
        	//Build JSON object:
        	let response = {};
			for (let i=0; i<rows.length; i++)
        	{
        		response['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;
        	}	//for
        	
        	//Handler for format option:
			if (req.query.format === 'json')
			{
				res.type('json').send(response);
			}	//if
			else if (req.query.format === 'xml')
			{
				let xml = js2xmlparser.parse("neighborhoods", response);
				res.type('xml').send(xml);
			}	//else if
			else
			{
				res.type('json').send(response);
			}	//else
        }	//else
    });	//db.all
});	//app.get

app.get('/incidents', (req, res) => 
{
    let query = "SELECT * FROM Incidents";
    let parameters = [];
    let first = true;
    //Handler for id:
    if (req.query.id)
    {
        //Put list of ids into array:
        let ids = req.query.id.split(",");
        if (first)
        {
            first = false;
            query = query + " WHERE (neighborhood_number = ?";
            parameters.push(ids[0]);
            for (let j = 1; j<ids.length; j++)
            {
                query = query + " OR neighborhood_number = ?";
                parameters.push(ids[j]);
            }   //for
            query = query + ")";
        }   //if
        else
        {
            query = query + " AND (neighborhood_number = ?";
            parameters.push(ids[0]);
            for (let j = 1; j<ids.length; j++)
            {
                query = query + " OR neighborhood_number = ?";
                parameters.push(ids[j]);
            }   //for
            query = query + ")";
        }   //else
    }   //if
    //Handler for code:
    if (req.query.code)
    {
        //Put list of codes into array:
        let codes = req.query.code.split(",");
        if (first)
        {
            first = false;
            query = query + " WHERE (code = ?";
            parameters.push(codes[0]);
            for (let j = 1; j<codes.length; j++)
            {
                query = query + " OR code = ?";
                parameters.push(codes[j]);
            }   //for
            query = query + ")";
        }   //if
        else
        {
            query = query + " AND (code = ?";
            parameters.push(codes[0]);
            for (let j = 1; j<codes.length; j++)
            {
                query = query + " OR code = ?";
                parameters.push(codes[j]);
            }   //for
            query = query + ")";
        }   //else
    }   //if
    //Handler for start_date:
    if(req.query.start_date)
    {
        if (first)
        {
            first = false;
            query = query + " WHERE (strftime('%s', date_time) > strftime('%s', ?)";
            parameters.push(req.query.start_date);
            query = query + ")";
        }   //if
        else
        {
            query = query + " AND (strftime('%s', date_time) > strftime('%s', ?)";
            parameters.push(req.query.start_date);
            query = query + ")";
        }   //else
    }   //if
    //Handler for end_date:
    if(req.query.end_date)
    {
        let end_date = req.query.end_date + "T23:59:59" 
        if (first)
        {
            first = false;
            query = query + " WHERE (strftime('%s', date_time) < strftime('%s', ?)";
            parameters.push(end_date);
            query = query + ")";
        }   //if
        else
        {
            query = query + " AND (strftime('%s', date_time) < strftime('%s', ?)";
            parameters.push(end_date);
            query = query + ")";
        }   //else
    }   //if
    //Handler for grid:
    if (req.query.grid)
    {
        //Put list of grids into array:
        let grids = req.query.grid.split(",");
        if (first)
        {
            first = false;
            query = query + " WHERE (police_grid = ?";
            parameters.push(grids[0]);
            for (let j = 1; j<grids.length; j++)
            {
                query = query + " OR police_grid = ?";
                parameters.push(grids[j]);
            }   //for
            query = query + ")";
        }   //if
        else
        {
            query = query + " AND (police_grid = ?";
            parameters.push(grids[0]);
            for (let j = 1; j<grids.length; j++)
            {
                query = query + " OR police_grid = ?";
                parameters.push(grids[j]);
            }   //for
            query = query + ")";
        }   //else
    }   //if

    query = query + " ORDER BY date_time desc";

    //Handler for limit:
    if (req.query.limit)
    {
        query = query + " Limit ?";
        parameters.push(req.query.limit);
    }   //if
    else
    {
        query = query + " Limit 10000";
    }   //else

    db.all(query, parameters, (err, rows) =>
    {
        if (err)
        {
            res.status(500).send('Error: could not retrieve data from database');
        }   //if
        else
        {
            response = {};
            for (let i=0; i<rows.length; i++)
            {
                let datetime = rows[i].date_time.split("T");
                let date = datetime[0];
                let time = datetime[1];
                response['I' + rows[i].case_number] =   {
                                                                'date': date,
                                                                'time': time,
                                                                'code': rows[i].code,
                                                                'incident': rows[i].incident,
                                                                'police_grid': rows[i].police_grid,
                                                                'neighborhood_number': rows[i].neighborhood_number,
                                                                'block': rows[i].block
                                                            };
            }   //for
            //Handler for format option:
            if (req.query.format === 'json')
            {
                res.type('json').send(response);
            }   //if
            else if (req.query.format === 'xml')
            {
                let xml = js2xmlparser.parse("incidents", response);
                res.type('xml').send(xml);
            }   //else if
            else
            {
                res.type('json').send(response);
            }   //else
        }   //else
    }); //db.all
}); //app.get

//PUT request handler for new-incident
app.put('/new-incident', (req, res) =>
{
    //Make sure right number of parameters are entered:
    if(!(req.body.case_number && req.body.date && req.body.time && req.body.code && req.body.incident && 
            req.body.police_grid && req.body.neighborhood_number && req.body.block))
    {
        res.status(500).send('Error: Missing parameter. Required parameters: case_number, date, time, code, incident, police_grid, neighborhood_number, block');
        return;
    }   //if

    //Make sure the case number doesn't exist:
	var has_id = false;
    let query = "Select * FROM incidents WHERE case_number = ?";
	db.all(query, [req.body.case_number], (err, rows) =>
    {
        if (rows.length > 0)
        {
            has_id = true;
        }   //if
        if (has_id)
        {
            res.status(500).send('Error: case number already exists');
        }   //if
        else
        {
            let date_time = req.body.date + "T" + req.body.time;
            let parameters = [req.body.case_number, date_time, req.body.code, req.body.incident, 
                                req.body.police_grid, req.body.neighborhood_number, req.body.block];
            let query = "";
            query = "INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block)";
            query = query + " VALUES(?, ?, ?, ?, ?, ?, ?)";

            //Add new incident to db:
            db.run(query, parameters, (err, rows) =>
            {
                if (err)
                {
                    res.status(500).send('Error adding new incident');
                }   //if
                else
                {
                    res.status(200).send('Successfully added new incident!');
                }   //else
            }); //db.run
        }   //else
    }); //db.get
});	//app.put