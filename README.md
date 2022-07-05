# p5.serialport

## About

p5.serialport is a [p5.js](https://p5js.org/) library that enables communication between your p5.js sketch and Arduino microcontroller (or another serial enabled device).

p5.serialport was created in 2015 at [New York University](https://www.nyu.edu/)'s [Interactive Telecommunications Program](https://tisch.nyu.edu/itp) by [Shawn van Every](https://github.com/vanevery/), [Jen Kagan](https://github.com/kaganjd), and [Tom Igoe](https://github.com/tigoe).

## What does it do?

p5.serialport more or less clones the [Processing Serial Library API](https://processing.org/reference/libraries/serial/index.html). As JavaScript in a browser can not interact directly with a serial port, this library solves this.

p5.serialport comes in two flavors; one is a simple app, this is good for all skill levels and is the easiest to use; another one is Node.js based WebSocket server, this is for more skilled advanced users or someone who needs heavy customization.

## p5.serial App

To begin download and run a release of p5.serialcontrol, available at https://github.com/p5-serial/p5.serialcontrol/releases. This application incorporates p5.serialserver in a GUI application for MacOS and Windows.

Once you have the application launched load one of the [examples](#examples) in your browser to see it in action.  

* You'll likely have to change the name of the serial port in the examples to the one your Arduino is using.

# p5.serial Node.js

To Use:

Connect an Arduino or other serial device to your computuer.

Clone or download this repo and install the dependencies with: ```npm install``` and start the server with: ```node startserver.js```

Alternatively, you can install the server globally via npm with ```sudo npm install -g p5.serialserver```  and then run it with ```p5serial``` or locally with ```npm install p5.serialserver``` and run it from the node_modules directory with ```node startserver.js```

Then load one of the [examples](#examples) in your browser to see it in action.  

* You'll likely have to change the name of the serial port in the examples to the one your Arduino is using.

Getting Started
--------------

After running either the [p5.serialcontrol application](https://github.com/p5-serial/p5.serialcontrol/releases) or p5.serialserver, you need to include the client side library in your html file. You can download the [p5.serialport.js client library](https://github.com/p5-serial/p5.serialport/blob/master/lib/p5.serialport.js) and include this as a script tag as below:

``` <script language="javascript" type="text/javascript" src="p5.serialport.js"> ```

or, you can use a CDN link available via [jsdelivr](https://www.jsdelivr.com/):

``` <script language="javascript" type="text/javascript" src="https://cdn.jsdelivr.net/npm/p5.serialserver@0.0.28/lib/p5.serialport.js"></script>```

[API](https://p5-serial.github.io/)
---

Examples
-------

* [Basic example](/examples/basics/)
* [Basic example with CDN link](/examples/basics-cdn/)
* [Echo example](/examples/echo/)
* [Echo with serial options example](/examples/echo2/)
* [Make port menu example](/examples/makePortMenu/)
* [Read and animate example](/examples/readAndAnimate/)
* [Read count example](/examples/readCount/)
* [Two Arduinos example](/examples/twoArduinos/)
* [Two Arduinos array example](/examples/twoArduinosArray/)
* [Write example](/examples/writeExample/)

### Basic Example

```javascript
let serial;

function setup() {
  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Let's list the ports available
  let portlist = serial.list();

  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("/dev/cu.usbmodem1421");

  // Register some callbacks

  // When we connect to the underlying server
  serial.on('connected', serverConnected);

  // When we get a list of serial ports that are available
  serial.on('list', gotList);

  // When we some data from the serial port
  serial.on('data', gotData);

  // When or if we get an error
  serial.on('error', gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen);
}

// We are connected and ready to go
function serverConnected() {
    print("We are connected!");
}

// Got the list of ports
function gotList(thelist) {
  // theList is an array of their names
  for (let i = 0; i < thelist.length; i++) {
    // Display in the console
    print(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  print("Serial Port is open!");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  print(theerror);
}

// There is data available to work with from the serial port
function gotData() {
  let currentString = serial.readStringUntil("\r\n");
  console.log(currentString);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a tring until a (line break) is encountered
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer

function draw() {
  // Polling method
/*
  if (serial.available() > 0) {
    let data = serial.read();
    ellipse(50,50,data,data);
  }
*/
}
```

Documentation
---------
To generate documentation, install jsdoc (``npm install -g jsdoc``) and run
```npm run doc```
