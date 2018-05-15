"use strict";

const pwm = require('adafruit-i2c-pwm-driver');
const { Servo, CachedPositionServoProxy } = require('../index.js');

const driver = pwm({ address: 0x40, device: '/dev/i2c-1', debug: false });

//const servo0 = new CachedPositionServoProxy(new Servo(0, driver), 200);

const max = 4095;

driver.setPWMFreq(20).then(() => {
  driver.setPWM(11, 0, 50);
})
.catch(e => { console.log('top level error', e); });

