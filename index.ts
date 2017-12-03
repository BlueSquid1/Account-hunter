import http = require('http');
//import { FinderAPI } from "./FinderAPI";

let portNum = process.env.PORT || 1337;

let server = http.createServer(newUserEvent);
server.listen(portNum);

/*
async function newUserEvent(req, res): Promise<void> {
    let finder = new FinderAPI();
    var x = await finder.GetInterest();
    res.write(x.toString());
    res.end();
}
*/

function newUserEvent(req, res) {
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end("Hello World!");
}