var command = {
    query: 0x10
  , disconnect: 0x40
  , beacon: 0x50
  , baud: 0x70
  , fetchOne: 0x80
  , ack: 0x90
};

var respond = {
    query: 0x01
  , disconnect: 0x04
  , beacon: 0x05
  , nak: 0x06
  , baud: 0x07
  , fetchOne: 0x08
  , eof: 0x09
};

var bauds = {
    b9600: 1
  , b19200: 2
  , b28800: 3
  , b38400: 4
  , b48000: 5
  , b57600: 6
  , b67200: 7
  , b76800: 8
  , b86400: 9
  , b96000: 10
  , b105600: 11
  , b115200: 12
};

var order = {
    newer: 1
  , older: 0
}

var acks = {
    resend: 0x00
  , ack: 0x01
  , stop: 0x02
};


var records = {
    bolus: 0x00
  , smart: 0x01
  , basal: 0x02
  , basalConfig: 0x03
  , alarm: 0x04
  , primes: 0x05
  , pump: 0x06
  , missedBasal: 0x07
  , timeChanges: 0x08
  , settings: 0x09
  , timeManager: 0x0A
};

var errors = [
    'No Sync byte'
  , 'CRC mismatch'
  , 'Baud rate index illegal'
  , 'Data query not linked to same record query'
  , 'Record number is out of range'
  , 'Order field is out of range'
  , 'Host ack code is out of range'
  , 'Message descriptor is out of range'
  , 'XXX: should never happen'
];


var constants = {
    SYNC: 0x7E
  , errors: errors
  , command: command
  , respond: respond
  , records: records
  , acks: acks
  , order: order
  , bauds: bauds
};

module.exports = constants;
