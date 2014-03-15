

var log = require("bunyan").createLogger({name: 'asante-porter'});
var protocol = require('./lib/driver');
module.exports = protocol;
var es = require('event-stream');


if (!module.parent) {
  console.log('Howdy', "let's talk to an insulin pump!");
  var com = require("serialport");
  var port = process.argv[2];
  var serial = new com.SerialPort(port, {baudrate: 9600});
  // should beacon at first
  function send (msg ) {
    msg = msg || "send";
    function write (d) {
      log.info(msg, d.length);
      serial.write(d);
      // this.emit('data', d);
    }
    return es.through(write);
  }
  serial.open(function (err) {
    console.log('opened', arguments);
    var opts = { log: log };
    var driver = protocol(opts);
    // driver.pipe(serial);
    // serial.pipe(driver);
    var stream = es.pipeline(serial, driver, send( ));
    var count = 0;
    driver.on('beacon', function (vars) {
      log.info('beacon', vars);
      if (++count > 1) {
        log.info('sending query');
        driver.query( );
        // .write(serial);
      }
    });
    driver.on('response', function (vars) {
      log.info('response', vars);
    });
  });

}
