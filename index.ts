import express = require('express');
import path = require('path');

import { finderAPI } from "./services/FinderAPI";

try {
	let portNum = process.env.PORT || 3000;

	let app = express();
	let finder = new finderAPI();
	finder.verbose = true;

	//retrieve any requested file from the "views" folder
	app.get('/views/:name', function (req, res) {
		res.sendFile(path.join(__dirname + '/views/' + req.params.name));
	});

	//call to api to get the latest data
	app.get('/savingAccounts', async function (req, res) {
		let savingDetails = await finder.GetInterestAccounts();
		res.send(savingDetails);
	});

	app.listen(portNum);
}
catch (err) {
	console.log(err.message);
}