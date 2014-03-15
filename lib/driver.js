
var bunyan = require('bunyan');

var consts = require('./constants');
var binary = require('binary');
var es = require('event-stream');
var put = require('put');
var crc = require('./crc');

var log = bunyan.createLogger({name: 'asante-porter-driver'});

function query ( ) {
  return this
    .word8(consts.SYNC)
    .word8(consts.command.query)
    .word8(0x00)
    .word8(0x00)
    .word8(0x8C)
    .word8(0x27)
    ;

}

function disconnect ( ) {
  return this
    .word8(consts.SYNC)
    .word8(consts.command.disconnect)
    .word8(0x00)
    .word8(0x00)
    .word8(0x42)
    .word8(0x79)
    ;

}

function setBaud (rate) {
  return this
    .word8(consts.SYNC)
    .word8(consts.command.baud)
    .word8(0x00)
    .word8(0x00)
    .word8(0x42)
    .word8(0x79)
}

function protocol (opts) {
  if (opts.log) {
    log = opts.log;
  }
  function dispatch (vars) {
    log.info('dispatch', vars);
    if (vars.code == 0x05) {
      stream.emit('beacon', vars);
    } else {
      stream.emit('response', vars);
    }
    return this;
  }

  var known = new Buffer([0x7E, 0x05, 0, 0, 0x1F, 0x8F]);
  var output = es.through(function (d) { this.emit('data', d); });

  var monitor = binary( )
    .loop(function onBeacon (end, vars) {
      message.call(this).tap(dispatch);
    })
  ;
  var stream = es.duplex(monitor, output);
  function message ( ) {
    log.debug('incoming message');
    return this
      .word8u('sync')
      .word8u('code')
      .tap(function (vars) {
        if (vars.sync == 0x7E) {
          return this
            .word8u('len0')
            .word8u('len1')
            .tap(function (vars) {
              vars.length = vars.len0 | (vars.len1 << 8);
              return this.into('payload', function ( ) {
                  this
                  .buffer('body', vars.length);
              });
            })
            .word8u('crc0')
            .word8u('crc1')
            ;
        }
      })
      ;
  }

  var self = stream;
  self.query = function doQuery ( ) {
    var o = query.call(put( ));
    o.write(output);
    return ;
  }
  return stream;

}

module.exports = protocol;

