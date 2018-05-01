# Easer
Simple servo easer that wraps standard pwm calls.

(the adafruit-i2c-pwm-driver api is used as the pwm interface)

Easer takes into account multiple requests for servo updates and timings. As well as handling same servo update while existing transition are running.  Intended for a set-and-go interaction.

### Client

Client that subscribes to mqtt message that delive a Server Style Sheet (css inspired) to control a set of servos and their timings.

The set-and-go nature of the easer allows the SSS to be applied similarly to the way CSS/DOM interaction works. 

