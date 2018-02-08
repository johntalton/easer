"use strict";

const pwm = require('adafruit-i2c-pwm-driver');

class Servo {
  constructor(id, pwm) {
    this._id = id;
    this._pwm = pwm
  }

  position() { throw Error('operation not supported'); }

  setPosition(pos) {
    return Promise.resolve(this._pwm.setPWM(this._id, 0, pos));
  }
}

class FeedbackServoProxy {
  constructor(servo, feedback) {
    this._servo = servo;
  }

  position() { }
  setPosition(pos) { this._servo.setPosition(pos); }
}

class CachedPositionServoProxy {
  constructor(servo, initposition) {
    this._servo = servo;
    this._position = initposition;
  }

  position() {
    return Promise.resolve(this._position);
  }
  
  setPosition(pos) {
    this._position = pos;
    return this._servo.setPosition(pos);
  }
}


class Easer {
  static ease(servo, options) {
    if(Easer.timer === undefined) {
      Easer.startTimer();
    }

    const ease = Easer.make(servo, options);
    Easer.easments.push(ease);

    return ease.p;
  }

  static startTimer() {
    Easer.timer = setInterval(() => Easer.update(), 10);
  }

  static inDelay(ease, nowMs) {
    return nowMs < ease.starttimeMs;
  }

  static inWindow(ease, nowMs) {
    return nowMs >= ease.starttimeMs && nowMs <= ease.endtimeMs;
  }

  static isExpired(ease, nowMs) {
    return nowMs > ease.endtimeMs;
  }

  static update() {
    const now = Date.now();

    const delay = Easer.easments.filter(ease => Easer.inDelay(ease, now));
    const ready = Easer.easments.filter(ease => Easer.inWindow(ease, now));
    const expired = Easer.easments.filter(ease => Easer.isExpired(ease, now));

    Easer.easments = Easer.easments.filter(ease => !Easer.isExpired(ease, now));

    ready.forEach(ease => {
      Easer.updateServo(ease, now);
    });
    
    expired.forEach(ease => {
      ease.resolve(true);
    });

    if(Easer.easments.length === 0) {
      console.log('empty, stop timer');
      clearInterval(Easer.timer);
      Easer.timer = undefined;
    }
  }

  static updateServo(ease, nowMs) {
    return ease.servo.position().then(pos => {
      const deltaMs = nowMs - ease.starttimeMs;
      const ratio = deltaMs / (ease.endtimeMs - ease.starttimeMs);
      if(!ease.from) { ease.from = pos; }
      const range = ease.to - ease.from;
      const target = ease.from + Math.round(range * ratio);

      //console.log(pos, deltaMs, ratio, ease.from, ease.to, range, target);
      return ease.servo.setPosition(target);
    });
  }

  static make(servo, options) {
    const nowMs = Date.now();
    const delayMs = options.delay * 1000;
    const durationMs = options.duration * 1000;

    let e = {
      servo: servo,
      inittimeMs: nowMs,
      starttimeMs: nowMs + delayMs,
      endtimeMs: nowMs + delayMs + durationMs,

      from: undefined,
      to: options.angle
    };

    e.p = new Promise((resolve, reject) => {
      e.resolve = resolve;
      e.reject = reject;
    });

    return e;
  }
}

Easer.timer = undefined;
Easer.easments = [];

const driver = pwm({ address: 0x40, device: '/dev/i2c-1', debug: false });

const servo1 = new CachedPositionServoProxy(new Servo(0, driver), 200);
const servo2 = new CachedPositionServoProxy(new Servo(1, driver), 200);

driver.setPWMFreq(50).then(() => {
  Promise.all([
    Easer.ease(servo1, { angle: 500, duration: 3, delay: 0, timing: 'ease' }),
    Easer.ease(servo2, { angle: 500, duration: 9, delay: 0 })
  ])
  //.then(results => { console.log('phase 1 done' ); })
  .then(() => Easer.ease(servo1, { angle: 200, duration: 1, delay: 3 }))
  .then(() => Easer.ease(servo2, { angle: 200, duration: 1, delay: 0 }))
})
.catch(e => { console.log('top level error', e); });

