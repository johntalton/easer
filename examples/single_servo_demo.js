"use strict";

const pwm = require('adafruit-i2c-pwm-driver');
const driver = pwm({ address: 0x40, device: '/dev/i2c-1', debug: false });

driver.setPWMFreq(20).then(() => {

  let base = Promise.resolve();

  [
   [250, 1000],

   [200,  150],
   [300,  150],
   [400,  150],
   [500,  150],
   [600,  150],
   [700,  150],
   [800,  150],
   [900,  150],
   [1000,  150],
   [1100,  150],
   [1200,  150],
   [1300,  150],
//   [1400,  500],
//   [1500,  500],
//   [1600,  500],

   [250, 1000]
  ].forEach(([len, delay]) => {
    base = base.then(() => new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('setting pwd', len);
        driver.setPWM(0, 0, len); resolve();
      }, delay);
    }));
  });

  return base.then(() => {
    console.log('done');
  })
})
.catch(e => { console.log('top level error', e); });

