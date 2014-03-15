

var consts = require('./constants');
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
    return this
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

