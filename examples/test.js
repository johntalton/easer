"use strict";

const pwm = require('adafruit-i2c-pwm-driver');
const { Easer, Servo, CachedPositionServoProxy } = require('../index.js');

const driver = pwm({ address: 0x40, device: '/dev/i2c-1', debug: false });

const servo0 = new CachedPositionServoProxy(new Servo(0, driver), 200);
const servo1 = new CachedPositionServoProxy(new Servo(1, driver), 200);

const servo4 = new CachedPositionServoProxy(new Servo(3, driver), 100);
const servo5 = new CachedPositionServoProxy(new Servo(8, driver), 200);

//const servo12 = new FeedbackServoProxy(new Servo(12, driver));
//const servo13 = new FeedbackServoProxy(new Servo(15, driver));
const servo12 = new CachedPositionServoProxy(new Servo(12, driver), 200);
const servo13 = new CachedPositionServoProxy(new Servo(15, driver), 200);


driver.setPWMFreq(50).then(() => {
  return Promise.all([
    Easer.ease(servo0, { angle: 500, duration: 3, delay: 0, timing: 'ease' }),
    Easer.ease(servo1, { angle: 500, duration: 5, delay: 0 }),
    Easer.ease(servo4, { angle: 500, duration: 7, delay: 0 }),
    Easer.ease(servo5, { angle: 500, duration: 3, delay: 0 })
  ])
  .then(() => Easer.ease(servo12, { angle: 400, duration: 5, delay: 0 }))
  .then(() => Easer.ease(servo13, { angle: 400, duration: 5, delay: 0 }))
  .then(() => Promise.all([
    Easer.ease(servo0, { angle: 200, duration: 1, delay: 0, timing: 'ease' }),
    Easer.ease(servo1, { angle: 200, duration: 1, delay: 0, timing: 'ease' }),
    Easer.ease(servo4, { angle: 200, duration: 1, delay: 0, timing: 'ease' }),
    Easer.ease(servo5, { angle: 200, duration: 1, delay: 0, timing: 'ease' }),
    Easer.ease(servo12, { angle: 200, duration: 1, delay: 0, timing: 'ease' }),
    Easer.ease(servo13, { angle: 200, duration: 1, delay: 0, timing: 'ease' })
  ]))
  .then(() => Easer.ease(servo0, { angle: 100, duration: 0.25, delay: 2 }))
  .then(() => Easer.ease(servo0, { angle: 500, duration: 0.25, delay: 0 }))
  .then(() => Easer.ease(servo0, { angle: 100, duration: 0.25, delay: 0 }))

})
.catch(e => { console.log('top level error', e); });

