const webSocketServer = require('websocket').server;
const http = require('http');

const webSocketsServerPort = 8000;

const server = http.createServer((req, res) => {
    res.write("Hello world!");
    res.end();
}).listen(webSocketsServerPort);

const wsServer = new webSocketServer({
    httpServer: server
});

const clients = {};
let gates = '[]';

const broadcast = (clients, message, currentClient) => {
    Object.values(clients).map((client) => {
        client.sendUTF(message.utf8Data);
    })
}

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

wsServer.on('request', (request) => {
    const userID = getUniqueID();
    console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');

    const connection = request.accept(null, request.origin);
    console.log(request.origin);
    clients[userID] = connection;

    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))

    connection.sendUTF(gates);

    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            if (gates !== message) {
                gates = message;
                console.log('Received Message: ' + message.utf8Data);
                broadcast(clients, message, userID);
            }
        }
    })

    connection.on('close', () => {
        delete clients[userID];
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});