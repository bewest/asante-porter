
var com = require("serialport");
var binary = require('binary');
var es = require('event-stream');
var put = require('put');

function protocol ( ) {
  function dispatch (vars) {
    console.log('dispatch', vars);
    if (vars.code == 0x05) {
      stream.emit('beacon', vars);
    } else {
      stream.emit('response', vars);
    }
    return this;
  }

  var known = new Buffer([0x7E, 0x05, 0, 0, 0x1F, 0x8F]);
  var stream = message.call(binary( ))
    .tap(dispatch)
    .loop(function onBeacon (end, vars) {
      message.call(this).tap(dispatch);
    })
  ;
  function message ( ) {
    console.log('incoming message');
    var self = this;
    return self
      .word8u('sync')
      .word8u('code')
      .word8u('length')
      .tap(function (vars) {
        if (vars.sync == 0x7E) {
          this
            .into('payload', function ( ) {
              this
              .buffer('body', vars.length === 0 ? 1 : vars.length)
            })
            .word8u('crc0')
            .word8u('crc1')
        }
      })
      ;
  }
  return stream;

}

module.exports = protocol;

if (!module.parent) {
  console.log('Howdy', "let's talk to an insulin pump!");
  var port = '/dev/ttyUSB.AsantePorter0';
  var serial = new com.SerialPort(port, {baudrate: 9600});
  // should beacon at first
  serial.open(function (err) {
    console.log('opened', arguments);
    serial.on('data', function (data) {
      console.log('beacon?', data.length, data);
    });
  });

}
