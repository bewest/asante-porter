
var constants = {
    SYNC: 0x7E
  , errors: errors
  , command: command
  , respond: respond
  , records: records
};

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

module.exports = constants;
