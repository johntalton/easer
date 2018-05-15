"use strict";

const pwm = require('adafruit-i2c-pwm-driver');
const { Easer, Servo, CachedPositionServoProxy } = require('../index.js');

const driver = pwm({ address: 0x40, device: '/dev/i2c-1', debug: false });

class Led {
  constructor(id, initPos) { this.pos = initPos; }
  position() { return Promise.resolve(this.pos); }
  setPosition(pos) { this.pos = pos; driver.setPWM(11, 0, this.pos); return Promise.resolve(); }
};

const led11 = new Led(11, 0);

const start = Date.now();
console.log('start', start);
driver.setPWMFreq(50)
  .then(() => Easer.ease(led11, { angle: 4000, duration: 5, delay: 0 }))
  .then(() => Easer.ease(led11, { angle: 0, duration: 3, delay: 0 }))

  .then(() => Easer.ease(led11, { angle: 1500, durationMs: 100, delay: 0 }))
  .then(() => Easer.ease(led11, { angle: 0, durationMs: 100, delay: 0 }))

  .then(() => Easer.ease(led11, { angle: 1500, durationMs: 100, delay: 0 }))
  .then(() => Easer.ease(led11, { angle: 0, durationMs: 100, delay: 0 }))



  .then(() => console.log('end', Date.now() - start))
.catch(e => { console.log('top level error', e); });

console.log('after all.', Date.now());
