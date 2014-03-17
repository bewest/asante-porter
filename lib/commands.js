var bunyan = require('bunyan');
var consts = require('./constants');
var crc = require('./crc');

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
    ;
}

function head (opcode, params) {
  var len = params.length;
  return this
    .word8(consts.SYNC)
    .word8(opcode)
    .word16le(len)
    .put(params)
    ;
}

function tail ( ) {
  var buff = this.buffer( );
  return this
    .word16le(crc(buff))
    ;
}

function command (opcode, params) {
  params = params || new Buffer([ ]);
  return tail.call(head.call(this, opcode, params));
}

function fetchOne (type, order) {
  var params = new Buffer([type, order]);
  return command.call(this, consts.command.fetchOne, params);
}

function ack (state) {
  var params = new Buffer([ state ]);
  return command.call(this, consts.command.ack, params);
}

var api = {
    disconnect: disconnect
  , setBaud: setBaud
  , query: query 
  , fetchOne: fetchOne
  , ack: ack
  , command: command
};

function configure (opts) {
}
module.exports = api;

if (!module.parent) {
  var put = require('put');
  var known = new Buffer([0x7E, 0x05, 0, 0, 0x1F, 0x8F]);
  var r = command.call(put( ), 0x05).buffer( )
  console.log('result', r);

  
}
