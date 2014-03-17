
var bunyan = require('bunyan');

var consts = require('./constants');
var binary = require('binary');
var es = require('event-stream');
var put = require('put');
var crc = require('./crc');

var log = bunyan.createLogger({name: 'asante-porter-driver'});

var commands = require('./commands');
var decodes = require('./decodes');

function protocol (opts) {
  if (opts.log) {
    log = opts.log;
  }
  var parsed = es.through(write_process);
  var queue = [ ];
  var expected = null
  function write_process(memo) {
    var send = memo.send;
    log.info('write_process', send.buffer( ));

  }

  function finish_process (vars) {
    var Q = queue.slice(0);
    queue = [ ];
    es.pipeline(es.readArray(Q), es.map(responses(vars)));
  }

  function dispatch (vars) {
    log.debug('dispatch', vars);
    if (vars.code == consts.respond.beacon) {
      stream.emit('beacon', vars);
    } else {
      if (vars.code == expected) {
        finish_process.call(this, vars);
        expected = null;
      } else {
        stream.emit('response', vars);
      }
    }
    return this;
  }
  function responses (vars) {
    function iter (item, next) {
      next(null, item(vars));
    }
    return iter;
  }

  var known = new Buffer([0x7E, 0x05, 0, 0, 0x1F, 0x8F]);
  var output = es.through(function (d) { this.emit('data', d); });

  var monitor = binary( )
    .loop(function onBeacon (end, vars) {
      message.call(this).tap(dispatch);
    })
  ;
  var stream = es.duplex(monitor, output);

  function process (send, recv, cb) {
    // send.write(output);
    function done (err, results) {
      log.info('process done', err, results);
      if (cb.call) {
        cb(err, results);
      }
    }

    // es.pipeline(send, output, recv, es.writeArray(done));
  }

  function message ( ) {
    log.debug('incoming message');
    return this
      .word8u('sync')
      .tap(function (vars) {
        if (vars.sync == 0x7E) {
          return this
        }
      })
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
            .tap(function validate (vars) {
              var raw = new Buffer([vars.sync, vars.code, vars.len0, vars.len1]);
              raw = Buffer.concat([raw, vars.payload.body]);
              var expected = put( ).word16le(crc(raw)).buffer( );
              var observed = put( ).word8(vars.crc0).word8(vars.crc1).buffer( );
              vars.payload.valid = false;
              if (expected[0] != vars.crc0  && expected[1] != vars.crc1) {
                log.warn('CRC MISMATCH %s: %s, %s: %s',
                  'expected', expected.toString('hex'),
                  'observed', observed.toString('hex')
                  );
                // this.flush( );
                return false;
              } else {
                vars.payload.valid = true;
                // parsed.write(vars);
              }

              return this;
            });
            ;
        } else {
          // help re-align the head buffer
          // this.flush( );
          this.skip(3);
          return false;
        }
      })
      ;
  }

  var self = stream;
  /*
  self.query = function query (cb) {
    var o = commands.query.call(put( ));
    function log_it (vars) {
      log.info("XXX", arguments);
      cb(vars);
    }
    expected = consts.respond.query;
    o.write(output);
    // process(o, log_it, log_it);
    queue.push(log_it);
    return ;
  }
  */

  Object.keys(commands).forEach(function install (command) {
    self[command] = function (cb) {
      var args = Array.prototype.slice.apply(arguments);
      log.info('sending', command, args, arguments);
      if (args.slice(-1).call) {
        cb = args.pop( );
      } else { cb = null; }
      var o = commands[command].apply(put( ), args); function exec (vars) {
        log.info("XXX exec", command, arguments);
        var decoder = decodes[command];
        if (decoder) {
          vars.body = decoder.call(binary.parse(vars.payload.body)).vars;
        }
        stream.emit(command, vars);
        if (cb && cb.call)
          cb(vars);
      }
      exec.name = command;
      expected = consts.respond[command];
      o.write(output);
      queue.push(exec);
      return ;
    }
  });
  return stream;

}

module.exports = protocol;

