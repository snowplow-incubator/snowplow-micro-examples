const EventEmitter = require('events');

class ResetMini extends EventEmitter {
  command() {

    const request = require('request');

    request('http://localhost:9090/micro/reset', { }, (err, res, body) => {
      if (err) {
        console.log(err);
        throw "Unable to reset micro";
      }
    });
    this.emit('complete');
    return this;

  }
}

module.exports = ResetMini;