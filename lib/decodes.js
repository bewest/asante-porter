
function query ( ) {
  return this
    .buffer('model', 4)
    .skip(1)
    .buffer('serial', 11)
    .skip(1)
    ;
}

function disconnect ( ) {
  return this;
}

function nak ( ) {
  return this;
}

function ack ( ) {
  return this;
}

function fetchOne ( ) {
  return this
  ;
}

function setBaud ( ) {
  return this;
}


function eof ( ) {
  return this;
}

function get ( ) {
  return this
    .tap(function findType (vars) {
      switch(vars.code) {
        case 0x01:
          break;
        default:
          break;
      }
    });
  ;
}

var api = {
    disconnect: disconnect
  , setBaud: setBaud
  , query: query 
  , fetchOne: fetchOne
  , eof: eof
};

module.exports = api;

