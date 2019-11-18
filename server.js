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
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

//GET request handler for codes
app.get('/codes', (req, res) => 
{
	let query = "SELECT * FROM Codes ORDER BY code";
    db.all(query, (err, rows) =>
    {
        if (err)
        {
            let msg = "Error: could not retrieve data from database";
            Write404Error(res, msg);
        }   //if
        else
        {
        	//Build JSON object:
        	let response = {};

        	//Handler for code:
        	if (req.query.code)
        	{
        		let codes = req.query.code.split(",");
        		for (let i=0; i<rows.length; i++)
	        	{
	        		if (codes.includes(rows[i].code.toString(10)))
	        		{
	        			response['C' + rows[i].code] = rows[i].incident_type;
	        		}	//if
	        	}	//for
        	}	//if
        	else
        	{
				for (let i=0; i<rows.length; i++)
	        	{
	        		response['C' + rows[i].code] = rows[i].incident_type;
	        	}	//for
        	}	//else
        	
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
	let query = "SELECT * FROM Neighborhoods ORDER BY neighborhood_number";
    db.all(query, (err, rows) =>
    {
        if (err)
        {
            let msg = "Error: could not retrieve data from database";
            Write404Error(res, msg);
        }   //if
        else
        {
        	//Build JSON object:
        	let response = {};

        	//Handler for code:
        	if (req.query.id)
        	{
        		let ids = req.query.id.split(",");
        		for (let i=0; i<rows.length; i++)
	        	{
	        		if (ids.includes(rows[i].neighborhood_number.toString(10)))
	        		{
	        			response['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;
	        		}	//if
	        	}	//for
        	}	//if
        	else
        	{
				for (let i=0; i<rows.length; i++)
	        	{
	        		response['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;
	        	}	//for
        	}	//else
        	
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

    let first = true;
    //Handler for id:
    if (req.query.id)
    {
        let ids = req.query.id.split(",");
        if (first)
        {
            first = false;
            query = query + " WHERE neighborhood_number = " + ids[0];
            for (let j = 1; j<ids.length; j++)
            {
                query = query + " OR neighborhood_number = " + ids[j];
            }
        }
        else
        {
            query = query + " AND neighborhood_number = " + ids[0];
            for (let j = 1; j<ids.length; j++)
            {
                query = query + " OR neighborhood_number = " + ids[j];
            }
        }
    }
    //Handler for code:
    if (req.query.code)
    {
        let codes = req.query.code.split(",");
        if (first)
        {
            first = false;
            query = query + " WHERE code = " + codes[0];
            for (let j = 1; j<codes.length; j++)
            {
                query = query + " OR code = " + codes[j];
            }   //for
        }   //if
        else
        {
            query = query + " AND code = " + codes[0];
            for (let j = 1; j<codes.length; j++)
            {
                query = query + " OR code = " + codes[j];
            }   //for
        }   //else
    }   //if
    //Handler for start_date:
    if(req.query.start_date)
    {
        if (first)
        {
            first = false;
            query = query + " WHERE strftime('%s', date_time) >= strftime('%s', '" + req.query.start_date + "')";
        }   //if
        else
        {
            query = query + " AND strftime('%s', date_time) >= strftime('%s', '" + req.query.start_date + "')";
        }   //else
    }   //if
    //Handler for end_date:
    if(req.query.end_date)
    {
        if (first)
        {
            first = false;
            query = query + " WHERE strftime('%s', date_time) <= strftime('%s', '" + req.query.end_date + "')";
        }   //if
        else
        {
            query = query + " AND strftime('%s', date_time) <= strftime('%s', '" + req.query.end_date + "')";
        }   //else
    }   //if
    //Handler for grid:
    if (req.query.grid)
    {
        let grids = req.query.grid.split(",");
        if (first)
        {
            first = false;
            query = query + " WHERE police_grid = " + grids[0];
            for (let j = 1; j<grids.length; j++)
            {
                query = query + " OR police_grid = " + grids[j];
            }
        }
        else
        {
            query = query + " AND police_grid = " + grids[0];
            for (let j = 1; j<grids.length; j++)
            {
                query = query + " OR police_grid = " + grids[j];
            }
        }
    }

    query = query + " ORDER BY date_time desc";
    //Handler for limit:
    if (req.query.limit)
    {
        query = query + " Limit " + req.query.limit;
    }
    else
    {
        query = query + " Limit 10000";
    }
    console.log (query);
    db.all(query, (err, rows) =>
    {
        if (err)
        {
            let msg = "Error: could not retrieve data from database";
            Write404Error(res, msg);
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
        }
    });
});

//GET request handler for incidents
/*
app.get('/incidents', (req, res) => 
{
	let query = "SELECT * FROM Incidents ORDER BY date_time desc";
    db.all(query, (err, rows) =>
    {
        if (err)
        {
            let msg = "Error: could not retrieve data from database";
            Write404Error(res, msg);
        }   //if
        else
        {
        	//Build JSON object:
        	let response = {};
			for (let i=0; i<10; i++)
        	{
        		let test = true;
        		let datetime = rows[i].date_time.split("T");
        		let date = datetime[0];
        		let time = datetime[1];
        		let temp = {};
        		temp['I' + rows[i].case_number] = 	{
    													'date': date,
    													'time': time,
    													'code': rows[i].code,
    													'incident': rows[i].incident,
    													'police_grid': rows[i].police_grid,
    													'neighborhood_number': rows[i].neighborhood_number,
    													'block': rows[i].block
        											};
                //Handler for id:
        		if (req.query.id)
        		{
					let ids = req.query.id.split(",");
    				if(!(ids.includes(temp['I' + rows[i].case_number].neighborhood_number.toString(10))))
    				{
    					test = false;
    				}	//if
        		}	//if
                //Handler for code:
                if (req.query.code)
                {
                    let codes = req.query.code.split(",");
                    if (!(codes.includes(rows[i].code.toString(10))))
                    {
                        test = false;
                    }   //if
                }   //if
                //Handler for grid:
                if (req.query.grid)
                {
                    let grids = req.query.grid.split(",");
                    if (!(grids.includes(rows[i].police_grid.toString(10))))
                    {
                        test = false;
                    }   //if
                }   //if
                //Handler for start_date:
                if (req.query.start_date)
                {

                }   //if
                //Handler for end_date:
                {

                }   //if
        		if (test)
        		{
        			response['I' + rows[i].case_number] = 	{
		    													'date': date,
		    													'time': time,
		    													'code': rows[i].code,
		    													'incident': rows[i].incident,
		    													'police_grid': rows[i].police_grid,
		    													'neighborhood_number': rows[i].neighborhood_number,
		    													'block': rows[i].block
	        												};
        		}	//if
        	}	//for
        	
        	//Handler for format option:
			if (req.query.format === 'json')
			{
				res.type('json').send(response);
			}	//if
			else if (req.query.format === 'xml')
			{
				let xml = js2xmlparser.parse("incidents", response);
				res.type('xml').send(xml);
			}	//else if
			else
			{
				res.type('json').send(response);
			}	//else
        }	//else
    });	//db.all
});	//app.get

//PUT request handler for new-incident
app.put('/new-incident', (req, res) =>
{
	var new_user = 
	{
		id: parseInt(req.body.id),
		name: req.body.name,
		email: req.body.email
	};	//new_user
	var has_id = false;
	for (let i = 0; i < users.users.length; i++)
	{
		if (users.users[i].id === new_user.id)
		{
			has_id = true;
			break;
		}	//if
	}	//for
	if (has_id)
	{
		res.status(500).send('Error: case number already exists');
	}	//if
	else
	{
		users.users.push(new_user);
		fs.writeFile(users_filename,JSON.stringify(users, null, 4), (err) =>
		{
			res.status(200).send('Success!');
		});	//writeFile
	}	//else
});	//app.put
*/

function Write404Error(res, msg) 
{
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write(msg);
    res.end();
}	//Write404Error

function WriteHtml(res, html) 
{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}	//WriteHtml


var server = app.listen(port);
console.log('Now listening on port ' + port);