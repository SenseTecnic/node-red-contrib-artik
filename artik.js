var fs = require('fs');
var path = require('path');
var nodefn = require('when/node');
var when = require('when');
var Gpio = require('onoff').Gpio;

//voltage conversion number from official Artik site:
//https://developer.artik.io/documentation/developer-guide/gpio/kernel-gpio.html#adc-interface
var VOLTAGE_CONVERSION = 0.439453125 *2;


module.exports = function(RED) {

  function artikOutNode(config){
    RED.nodes.createNode(this,config);
    var node = this;
    node.pin = config.pin;

    function setGPIOOut(pin, state){
      return nodefn.call(fs.writeFile, "/sys/class/gpio/export", pin).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ pin +"/direction", "out");
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ pin +"/active_low", "0");
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ pin +"/value", state);
      }).then(function(){
        node.log(RED._("artik.status.write_success"));
      }).otherwise(function(err){
        node.error(RED._("artik.errors.writing-error"));
      });
    };

    var enableInitialState = config.enableInitialState;
    var initialState = config.initialState;

    if (enableInitialState === true){
        nodefn.call(fs.stat, '/sys/class/gpio/gpio'+ node.pin).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/gpio/unexport", node.pin);
        }).then(function () {
          setGPIOOut(node.pin, initialState);
        }).otherwise(function(){
          setGPIOOut(node.pin, initialState);
        });
    };

    this.on('input', function(msg){
      node.state = ( msg.payload.hasOwnProperty("state") && (msg.payload.state == '1' || msg.payload.state == '0')) ? msg.payload.state : config.state;
      if( !(typeof node.pin == 'undefined' || node.pin == '')){
        
        nodefn.call(fs.stat, '/sys/class/gpio/gpio'+ node.pin).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/gpio/unexport", node.pin);
        }).then(function () {
          setGPIOOut(node.pin, node.state);
        }).otherwise(function(){
          setGPIOOut(node.pin, node.state);
        });
      } else {
        node.error(RED._("artik.errors.pin-error"));
      }
    });

    this.on('close', function(){
      nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ node.pin +"/value", 0).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ pin +"/active_low", "0");
      }).then(function(){
        return nodefn.call(fs.stat, '/sys/class/gpio/gpio' + node.pin);
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/unexport", node.pin);
      }).then(function () {
      }).otherwise(function(){
      });
    })
  }
  RED.nodes.registerType("artik_out", artikOutNode);

  function artikInNode(config){
    RED.nodes.createNode(this,config);
    var node = this;
    var monitoringPin;

    function init() {
      monitoringPin = new Gpio(config.pin, 'in', config.edge, options);
      monitoringPin.unwatch();

      //Set up interrupt
      if(config.enableInterrupt === true){
        monitoringPin.watch(function(err, value){
          if(err){
            throw err;
          }
          var newMsg = {
            payload:{
              state : value
            }
          }
          node.send(newMsg);
        });
      }
    }

    function readIn(gpio){
      var reading = gpio.readSync();
      var newMsg = {
        payload:{
          state : reading
        }
      }
      node.send(newMsg);
    }

    var options ={
      debounceTimeout: config.debounce || 0
    }

    if(config.pin !== ''){
      nodefn.call(fs.stat, '/sys/class/gpio/gpio'+ config.pin).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/unexport", config.pin);
      }).then(function () {
        init();
      }).otherwise(function(){
        init();
      });
    }

    this.on('input', function(msg){
      if( !(typeof config.pin == 'undefined' || config.pin == '')){
        readIn(monitoringPin);
      } else {
        node.error(RED._("artik.errors.pin-error"));
      }
    })

    this.on('close', function(){
      if(config.enableInterrupt == 'true'){
        monitoringPin.unwatch();
        monitoringPin.unexport();
      }
    })
  }
  RED.nodes.registerType("artik_in",artikInNode);  

  function artikADCNode(config){
    RED.nodes.createNode(this,config);
    var node = this;
    node.pin = config.pin;

    function readADC(pin, platform){

      var raw_reading;
      var platform_path = (platform === "artik_10")? "/sys/devices/12d10000.adc/iio:device0/" : "/sys/devices/126c0000.adc/iio:device0/" ;
      return nodefn.call(fs.readFile, platform_path + '/in_voltage' + pin + '_raw').then(function(data){
        raw_reading = data.toString('ascii', 0);
        return raw_reading * VOLTAGE_CONVERSION;
      }).then(function(raw_reading){
        var newMsg = {
          payload:{
            value: raw_reading
          }
        };
        node.send(newMsg);
        node.log(RED._("artik.status.adc_success"));
      }).otherwise(function(err){
        node.error(RED._("artik.error.adc-error"));
      });
    }

    this.on('input', function(msg){
      if( !(typeof node.pin == 'undefined' || node.pin == '')){
        readADC(node.pin, config.platform);
      } else {
        node.error(RED._("artik.errors.pin-error"));
      }
    })
  }
  RED.nodes.registerType("artik_adc",artikADCNode);  

  function artikPWMNode(config){
    RED.nodes.createNode(this,config);
    var node = this;
    node.pin = config.pin;
    
    function setPWMOut(pin, state, dutycycle, period){
      return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/export", pin).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/pwm"+ pin +"/period", period);
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/pwm"+ pin +"/duty_cycle", dutycycle);
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/pwm"+ pin +"/enable", 0);
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/pwm"+ pin +"/enable", state);
      }).then(function(){
        node.log(RED._("artik.status.pwm_success"));
      }).otherwise(function(err){
        node.error(RED._("artik.errors.pwm-error"));
      });
    };

    if (config.enableInitialState === true){    
        nodefn.call(fs.stat, '/sys/class/pwm/pwmchip0/pwm' + config.pin).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/unexport", config.pin);
        }).then(function () {
          setPWMOut(config.pin, config.initialState, config.initialDutyCycle, config.initialPeriod);
        }).otherwise(function(){
          setPWMOut(config.pin, config.initialState, config.initialDutyCycle, config.initialPeriod);
        });
    };

    this.on('input', function(msg){
      node.state = ( msg.payload.hasOwnProperty("state") && (msg.payload.state == '1' || msg.payload.state == '0')) ? msg.payload.state : config.state;
      node.dutyCycle = ( msg.payload.hasOwnProperty("dutyCycle")) ? msg.payload.dutyCycle : config.dutyCycle;
      node.period = ( msg.payload.hasOwnProperty("period")) ? msg.payload.period : config.period;

      if( !(typeof node.pin == 'undefined' || node.pin == '')){
        nodefn.call(fs.stat, '/sys/class/pwm/pwmchip0/pwm' + node.pin).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/unexport", node.pin);
        }).then(function () {
          setPWMOut(node.pin, node.state, node.dutyCycle, node.period);
        }).otherwise(function(){
          setPWMOut(node.pin, node.state, node.dutyCycle, node.period);
        });
      } else {
        node.error(RED._("artik.errors.pin-error"));
      }
    });

    this.on('close', function(){
      nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/pwm"+ node.pin +"/enable", 0).then(function(){
        return nodefn.call(fs.stat, '/sys/class/pwm/pwmchip0/pwm' + node.pin);
      }).then(function(){
        return nodefn.call(fs.writeFile, "/sys/class/pwm/pwmchip0/unexport", node.pin);
      }).then(function () {
      }).otherwise(function(){
      });
    })
  }
  RED.nodes.registerType("artik_pwm",artikPWMNode); 

}

