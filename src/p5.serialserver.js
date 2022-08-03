const Client = require('./Client.js');
const SerialPort = require('./SerialPort.js');

class p5SerialServer {
  constructor() {
    // variable to decide whether to console.log detailed messages
    this.logging = true;
    // web socket server. Initialized in start() function
    this.wss = null;
    // array of all opened serial port names in string
    this.serialPortsList = [];
    // array of all opened SerialPort objects
    this.serialPorts = [];
    // Array of all connected Client objects
    this.clients = [];
  }

  // console.log messages when logging is true
  logit(mess) {
    if (this.logging) {
      console.log(mess);
    }
  }
  // initialize web socket server at port 8081.
  // initialize web socket clients on connection by creating
  // a Client object and create a SerialPort object
  // after determining that it has not been opened already
  // initialize web socket client message events
  // port parameter:  port number used to open web socket server
  start(port) {
    this.logit('start()');

    let serverPort = port;
    let WebSocketServer = require('ws').Server;
    this.wss = new WebSocketServer({
      perMessageDeflate: false,
      port: serverPort,
    });

    this.wss.on('connection', (ws) => {
      // push the connection into the array of clients
      let client = new Client(ws);
      this.clients.push(client);

      // create an object to hold information about the connection
      this.logit(`${this.clients.length} clients connected`);

      client.ws.on('message', function (inmessage) {
        let message = JSON.parse(inmessage);

        if (
          typeof message !== 'undefined' &&
          typeof message.method !== 'undefined' &&
          typeof message.data !== 'undefined'
        ) {
          if (message.method === 'echo') {
            client.echo(message.data);
          } else if (message.method === 'list') {
            logit('message.method === list');
            client.list();
          } else if (message.method === 'openserial') {
            // HEREIAM
            logit('message.method === openserial');

            if (typeof message.data.serialport === 'string') {
              let newPort = message.data.serialport;
              let newPortOptions = message.data.serialoptions;

              // before opening new port, clean up array
              for (let i = 0; i < this.serialPortsList.length; i++) {
                if (this.serialPortsList[i].serialport === null) {
                  this.serialPorts.splice(i, 1);
                }
              }
              if (this.serialPortsList.length > 0) {
                // specified serial port is already opened
                if (this.serialPortsList.indexOf(newPort) > -1) {
                  let portIndex =
                    this.serialPortsList.indexOf(newPort);

                  if (client.serialPortsList.indexOf(newPort) > -1) {
                    client.sendit({
                      method: 'error',
                      data: 'Already open',
                    });
                    logit(`serialPort ${newPort} is already open`);
                    client.sendit({ method: 'openserial', data: {} });
                    // end of  if (client.serialPortsList.indexOf(newPort) > -1)
                  } else {
                    // add existing serial port to the client
                    this.serialPorts[portIndex].addClient(client);
                    client.openSerial(this.serialPorts[portIndex]);
                    client.sendit({ method: 'openserial', data: {} });
                  }
                } else {
                  this.serialPortsList.push(newPort);
                  let newSerialPort = new SerialPort(
                    newPort,
                    newPortOptions,
                  );
                  this.serialPorts.push(newSerialPort);

                  newSerialPort.addClient(client);
                  client.openSerial(newSerialPort);
                }
              } else {
                // first serial connection
                this.serialPortsList.push(newPort);
                let newSerialPort = new SerialPort(
                  newPort,
                  newPortOptions,
                );
                this.serialPorts.push(newSerialPort);

                newSerialPort.addClient(client);
                client.openSerial(newSerialPort);
              }
            } else {
              logit("user didn't specify a port to open");
              client.sendit({
                method: 'error',
                data: 'you must specify a serial port to open',
              });
            }
          } else if (message.method === 'write') {
            client.write(message.data);
          } else if (message.method === 'close') {
            logit('message.method === close');

            for (let i = 0; i < client.serialPortsList.length; i++) {
              let portIndex = this.serialPortsList.indexOf(
                client.serialPortsList[i],
              );
              if (this.serialPorts[portIndex] !== null) {
                this.serialPorts[portIndex].closeSerial();
                this.serialPorts.splice(portIndex, 1);
                this.serialPortsList.splice(portIndex, 1);
              }
            }
          }
        } else {
          console.log(
            'not a message I understand: ' + JSON.stringify(message),
          );
        }
      });

      // check if this is called if browser cvlosed
      // needs to be explicitly closed
      // other clients need to receive broadcast that it was closed
      this.wss.on('close', function () {
        logit(`ws.on close - ${this.clients.length} client left`);

        for (let c = 0; c < this.clients.length; c++) {
          if (this.clients[c].ws === ws) {
            logit('removing client from array');

            this.serialPorts.forEach((port) =>
              port.removeClient(this.clients[c]),
            );

            this.clients.splice(c, 1);
            logit(
              `clients.splice - ${this.clients.length} clients left`,
            );
            break;
          }
        }

        if (this.clients.length == 0) {
          logit(
            `clients.length == 0 checking to see if we should close serial port`,
          );

          // should close serial prots
          for (let i = 0; i < this.serialPorts.length; i++) {
            this.serialPorts[i].closeSerial();
          }

          this.serialPorts = [];
          this.serialPortsList = [];
        }
      });
    });
  }
}

// @event Client#message
// @param {Object} inmessage -
// Type of message emitted from { @link Client Client }.
// Defined message types are: echo, list, openserial, write, close and error.
// Undefined message types are treated as error messages

/**
 * @function stop
 * @desc Stops web socket server after closing all {@link SerialPort SerialPort} connections and {@link Client Client} connections
 * */
let stop = function () {
  logit('stop()');

  for (let i = 0; i < serialPorts.length; i++) {
    if (
      serialPorts[i].serialPort != null &&
      typeof serialPorts[i].serialPort === 'object' &&
      serialPorts[i].serialPort.isOpen
    ) {
      logit('serialPort != null && serialPort.isOpen is true');
      logit('serialPort.flush, drain, close');

      serialPorts[i].serialPort.flush();
      serialPorts[i].serialPort.drain();
      serialPorts[i].serialPort.close(function (error) {
        if (error) {
          console.log('Serial Close Error: ' + error);
        }
      });

      serialPorts.splice(i, 1);
      serialPortsList.splice(i, 1);
    }
  }

  try {
    for (let c = 0; c < clients.length; c++) {
      if (clients[c] != null) {
        logit('clients[' + c + '] != null, close');

        clients[c].ws.close();
      }
    }
  } catch (e) {
    console.log('Client Close Error: ' + e);
  }

  if (wss != null) {
    logit('wss != null so wss.close()');
    wss.close();
  }

  // Let's try to close a different way
  for (let i = 0; i < serialPorts.length; i++) {
    if (
      serialPorts[i].serialPort != null &&
      typeof serialPorts[i].serialPort === 'object' &&
      serialPorts[i].serialPort.isOpen
    ) {
      logit(
        'serialPort != null && serialPort.isOpen is true so serialPort = null',
      );
      serialPorts[i].serialPort = null;
    }
  }
};

module.exports = p5SerialServer;
