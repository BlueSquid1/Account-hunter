import http = require('http');
import { FinderAPI } from "./FinderAPI";

let portNum = 2000;

let server = http.createServer(newUserEvent);
server.listen(portNum);

async function newUserEvent(req, res): Promise<void> {
    let finder = new FinderAPI();
    var x = await finder.GetInterest();
    res.write(x.toString());
    res.end();
}