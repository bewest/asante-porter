

var log = require("bunyan").createLogger({name: 'asante-porter'});
var protocol = require('./lib/driver');
module.exports = protocol;

if (!module.parent) {
  console.log('Howdy', "let's talk to an insulin pump!");
  var com = require("serialport");
  var port = process.argv[2];
  var serial = new com.SerialPort(port, {baudrate: 9600});
  // should beacon at first
  serial.open(function (err) {
    console.log('opened', arguments);
    var driver = protocol( );
    serial.pipe(driver);
    driver.on('beacon', function (vars) {
      log.info('beacon', vars);
    });
    driver.on('response', function (vars) {
      log.info('response', vars);
    });
  });

}
