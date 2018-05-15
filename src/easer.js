"use strict";

/**
 *
 **/
class Easer {
  static ease(servo, options) {
    if(Easer.timer === undefined) {
      Easer.startTimer();
    }

    const ease = Easer.make(servo, options);

    const superseded = Easer.easments.filter(ease => ease.servo === servo);
    superseded.forEach(ghost => {
      ghost.resolve(false);
      Easer.easments.splice(Easer.easments.indexOf(ghost), 1);
    });

    Easer.easments.push(ease);

    return ease.p;
  }

  static startTimer() {
    Easer.timer = setInterval(() => Easer.update(), 50);
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
      //console.log('empty, stop timer');
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

      const deltaPos = Math.abs(target - pos);
      if(deltaPos <= 1) { return Promise.resolve(); }

      //console.log(pos, deltaMs, ratio, ease.from, ease.to, range, target);
      return ease.servo.setPosition(target);
    });
  }

  static make(servo, options) {
    const nowMs = Date.now();
    const delayMs = options.delay * 1000;
    const durationMs = options.durationMs !== undefined ? options.durationMs : (options.duration * 1000);

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

//if()
console.log('init timer and easments value');
Easer.timer = undefined;
Easer.easments = [];

module.exports.Easer = Easer;
