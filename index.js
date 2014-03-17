

var log = require("bunyan").createLogger({name: 'asante-porter'});
var protocol = require('./lib/driver');
module.exports = protocol;
var es = require('event-stream');


if (!module.parent) {
  console.log('Howdy', "let's talk to an insulin pump!");
  var com = require("serialport");
  var port = process.argv[2];
  var serial = new com.SerialPort(port, {baudrate: 9600});
  var consts = require('./lib/constants');
  // should beacon at first
  function send ( ) {
    function write (d) {
      serial.write(d);
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
    driver.on('query', function (vars) {
      log.info('query',
        vars.body.model.toString('ascii'),
        vars.body.serial.toString('ascii'));
      driver.fetchOne(consts.records.settings, consts.order.older, function fetched (vars) {
        log.info("HMMMM XXX", vars);
      });
      // driver.disconnect( );
    });
    driver.on('fetchOne', function (vars) {
      log.info('got fetchOne', vars);
      // driver.ack(consts.acks.ack);
      log.info('sending ack', consts.acks.stop, consts.acks);
      driver.ack(consts.acks.stop);
    });
    driver.on('ack', function (vars) {
      log.info('got ack', vars);
      if (vars.payload.body[0] == vars.code) {
        log.info('EOF');
        driver.disconnect( );
      }
    });
    driver.on('disconnect', function (vars) {
      log.info('disconnect');
    });
  });

}
