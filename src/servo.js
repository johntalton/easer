"use strict";

/**
 *
 */
class AdafruitPWMServo {
  constructor(id, pwm) {
    this._id = id;
    this._pwm = pwm
  }

  position() { throw Error('operation not supported'); }

  setPosition(pos) {
    return Promise.resolve(this._pwm.setPWM(this._id, 0, pos));
  }
}

/**
 *
 */
class FeedbackServoProxy {
  constructor(servo, feedback) {
    this._servo = servo;
  }

  position() { return Promise.resolve(0); }
  setPosition(pos) { return this._servo.setPosition(pos); }
}

/**
 *
 */
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

module.exports.Servo = AdafruitPWMServo;;
module.exports.FeedbackServo = FeedbackServoProxy;
module.exports.CachedPositionServoProxy = CachedPositionServoProxy;
