import express = require('express');
import path = require('path');

import { FinderAPI } from "./services/FinderAPI";

let portNum = process.env.PORT || 3000;

let app = express();
let finder = new FinderAPI();
finder.verbose = true;

//retrieve any requested file from the "views" folder
app.get('/views/:name', function(req, res){
	res.sendFile(path.join(__dirname + '/views/' + req.params.name));
});

//call to api to get the latest data
app.get('/savingAccounts', async function(req, res){
	let savingDetails = await finder.GetInterestAccounts();
	res.send(savingDetails);
});

app.listen(portNum);