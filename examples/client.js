"use strict";

const fs = require('fs');

const pwm = require('adafruit-i2c-pwm-driver');
const mqtt = require('mqtt');
const { Servo, CachedPositionServoProxy } = require('../index.js');
const { ServoStyleSheet, Mapper } = require('./sss.js');

class Config {
  static config(p) {
    return new Promise((resolve, reject) => {
      fs.readFile(p, 'utf-8', (err, data) => {
        if(err) { reject(err); return; }
        resolve(JSON.parse(data));
      });
    });
  }
}

function configureCnC(config) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(process.env.mqtturl, { reconnextPeriod: config.mqtt.reconnectMs });
    //const client = mqtt.connect(config.mqtt.url, { reconnextPeriod: config.mqtt.reconnectMs });
    client.on('connect', () => {

      console.log('attempt to subscribe');
      client.subscribe(config.mqtt.topic, {}, (err, granted) => {
        if(err) { reject(err); }
        console.log('subscription setup', granted);

        client.on('message', (topic, message, packet) => {
          console.log('Message', topic, message.toString());

          // TODO support bus selector on message or by sub topic
          console.log('**FIRST BUS**');
          const servos = config.buses[0].servos;

          const transformFn = ServoStyleSheet.compile(message.toString());
          transformFn(new Mapper(servos))
            .then(() => { console.log('transformation applied'); })
            .catch(e => { console.log('tranformFn error', e); process.exit(-1); });
        });

        resolve();
      });


    });
    client.on('offline', () => { console.log('offline', process.env.mqtturl); process.exit(-1); });
    client.on('error', () => {});

  });
}

function configureEaser(config) {
  return Promise.all(config.buses.map(bus => {
    bus.client = pwm({ address: bus.address, device: bus.device, debug: false });
    return Promise.all(bus.servos.map(servo => {
      servo.client = new CachedPositionServoProxy(new Servo(servo.id, bus.client), 200);
    }));
  }));

}

Config.config('./client.json').then(config => {
  return Promise.all([
    configureEaser(config),
    configureCnC(config)
  ]);
})
.catch(e => {
  console.log('top-level error', e);
});
