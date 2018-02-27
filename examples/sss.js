"use strict";

const { Easer } = require('../index.js');

/*
#0 {
  angle: 90;
  duration: 1s;
  delay: 100ms;
  timing: ease;
}

.armLeft {

}

.lowerArmLeft {

}
*/
/**

  const fn = ServoStyleSheet.compile(sss);
  ... // some time later, or many times later
  fn(new AppServoMapper(config))

**/
class ServoStyleSheet {
  static compile(sss) {
    const x = ServoStyleSheet._parse(sss);
    return (mapper) => {
      return Promise.all(x.map(ruleFn => ruleFn(mapper)));
    };
  }

  static _parse(sss) {
    const oneline = sss
      .split('\n')
        .filter(line => {
          const i = line.lastIndexOf('//');
          if(i === 0) { return ''; }
          if(i === -1) { return line.trim(); }
          return line.substring(0, i - 1).trim();
        })
        .join('')
      .split(' ').join('')
      .split('\t').join('');

    return oneline.split('}')
      .filter(b => b !== '')
      .map(body => {

      const s_ps = body.split('{');
      if(s_ps.length !== 2) { throw Error('s_ps not 2  body split error'); }
      const selector = s_ps[0].trim(); // .first plaese js
      const propset = s_ps[1].trim(); // .last

      const params = propset.split(';')
        .filter(p => (p !== ''))
        .reduce((out, prop) => {

        const p_v = prop.split(':');
        if(p_v.length !== 2) { throw Error('p_v not 2 prop split error'); }
        const property = p_v[0];
        const value = p_v[1];
        out[property] = value;
        return out;
      }, {});

      console.log('\t\twoop', params);

      return (mapper) => {
        return Easer.ease(mapper.resolve(selector), {
            angle: params.angle,
            duration: 1,
            delay: 0,
            timing: 'ease'
          });
       };
    });
  }
}

class Mapper {
  constructor(servoIdNameAry) {
    this.servos = servoIdNameAry;
  }

  resolve(selector) {
    if(selector.startsWith('#')) { return this._byid(selector.substr(1)); }
    if(selector.startsWith('.')) { return this._bynane(selector.substr(1)); }
    throw Error('unknown selector: ' + selector);
  }

  _byid(id) {
    console.log('find by id', id);
    return this.servos.find(servo => servo.id.toString() === id.toString()).client;
  }

  _byname(name) {
    console.log('find by name', name);
    return this.servos.find(servo => servo.name === name).client;
  }
}

module.exports = {
  ServoStyleSheet: ServoStyleSheet,
  Mapper: Mapper
};
