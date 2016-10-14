# node-red-contrib-artik


These are [Node-RED](http://nodered.org) nodes that interface GPIO pins on [Artik boards](https://developer.artik.io/overview) specifically for the functions of writing output value to a pin, reading input value from a pin, setting a PWM pin and reading ADC value from an ADC pin. These nodes perform their functionalities based on the standard Linux **sysfs** function(Read more on [GPIO Control through Sysfs](https://developer.artik.io/documentation/developer-guide/gpio/kernel-gpio.html#gpio-control-through-sysfs)). Currently the nodes have been tested on both the Artik 10 and Artik 5 modules. For physical pin mapping location, please refer to [GPIO Mapping by Header](https://developer.artik.io/documentation/developer-guide/gpio/gpio-mapping.html). 

Tutorials on the usage of these Artik nodes can also be found via [this link](http://developers.sensetecnic.com/article/tutorial-controlling-an-artik-board-using-fred-and-node-red/).


## Pre-requesites

To run these nodes, please ensure the nodes are installed on your Artik board, and node-red has access to the `/sys` folders. 


## Install

Run the follwing command in the root directory of your Node-RED install.
Usually this is `~/.node-red` .
```
    npm install node-red-contrib-artik
```

## Usage

### Artik Out Node

Sets the value of a GPIO pin in the **out** direction. Pin number can be set in the config tab, and the state can be set in the config tab, or be overwritten by the incoming `msg.payload.state` with value 0 for LOW, and 1 for HIGH. At the moment, this Artik Out node is set to always active high.

For example, to over write the settings in the config tab, insert a function node in the flow above consists of the following:

```
  msg.payload = {
      state: 1
  }
  return msg;
```

Here is an example flow that has the node configured to turn pin #22 HIGH, and there is also an incoming `msg.payload` that turns the pin LOW.


```
  [{"id":"76c87d85.944174","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":158,"y":59,"wires":[["5056aee8.65d47"]]},{"id":"5056aee8.65d47","type":"artik_out","z":"39a9affc.48f19","name":"","pin":"22","state":"1","enableInitialState":"","initialState":"","x":380,"y":67,"wires":[]},{"id":"37323dd0.806d82","type":"function","z":"39a9affc.48f19","name":"off","func":"var newMsg = {\n    payload:{\n        state:0\n    }\n}\nreturn newMsg;","outputs":1,"noerr":0,"x":284,"y":145,"wires":[["5056aee8.65d47"]]},{"id":"f3f9278e.aa6c28","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":142,"y":146,"wires":[["37323dd0.806d82"]]}]  
```

User can also set the **Initial State** of a GPIO pin when flows are deployed. Simply check **Set initial state?** in the config tab, the node will prompt the user for the initial state.

Here is an example flow similar to the example above but with the initial state setting configured to HIGH.

```
  [{"id":"76c87d85.944174","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":158,"y":59,"wires":[["5056aee8.65d47"]]},{"id":"5056aee8.65d47","type":"artik_out","z":"39a9affc.48f19","name":"","pin":"22","state":"1","enableInitialState":true,"initialState":"1","x":380,"y":67,"wires":[]},{"id":"37323dd0.806d82","type":"function","z":"39a9affc.48f19","name":"off","func":"var newMsg = {\n    payload:{\n        state:0\n    }\n}\nreturn newMsg;","outputs":1,"noerr":0,"x":284,"y":145,"wires":[["5056aee8.65d47"]]},{"id":"f3f9278e.aa6c28","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":142,"y":146,"wires":[["37323dd0.806d82"]]}]
```

### Artik In Node

Reads the value of a GPIO pin in the **in** direction. Pin number can be set in the config tab. 
When an the node is triggered( for example, an inject node), the node will read the value of the specified GPIO pin, and returns `msg.payload.value` indicating the status of the pin. 1 means a HIGH, and 0 means a LOW. `msg.payload.interrupt` would indicates if this msg was triggered by the interrupt action or not. Here is an example for reading on pin #22:

```
  [{"id":"761df489.fc35fc","type":"artik_in","z":"39a9affc.48f19","name":"","pin":"22","enableInterrupt":"","edge":"","debounce":"","x":304,"y":254,"wires":[["282c49fd.eb67c6"]]},{"id":"9e7259f3.e7f6c8","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":125,"y":246,"wires":[["761df489.fc35fc"]]},{"id":"282c49fd.eb67c6","type":"debug","z":"39a9affc.48f19","name":"","active":true,"console":"false","complete":"false","x":489,"y":251,"wires":[]}]
```

This Artik In Node can also read interrupt from a GPIO pin. By checking **Enable interrupt?**, the config tab will prompt the user for the edge to detect, and the debounce delay.

* **Set edge:** users can seletect which edge to set the interrupt, either the rising edge, falling edge, or both of them.
* **Debounce delay:** users can set the debounce delay for each detection in milliseconds.

Note that when in interrupt mode, user can still use the inject node to trigger manual reading of the GPIO status. 


### Artik ADC Node

Reads the value of an ADC pin and shows the value in mV. Please refer to [Artik document](https://developer.artik.io/documentation/developer-guide/gpio/kernel-gpio.html) to find out the ADC reading range supported on your Artik board. 

In the config tab, you can set the pin number of the ADC pin on your board( either 0 or 1), and also the select the platform of the board you are using. When the node is triggered( for example, an inject node), the node will read the ADC value on the specified pin and return the value in mV. Here is an example flow.

```
  [{"id":"8a5ad3c6.cf3ad","type":"artik_adc","z":"39a9affc.48f19","name":"","pin":"0","platform":"artik_10","x":314,"y":369,"wires":[["64df6204.e24c4c"]]},{"id":"ed93cee8.222be","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":128,"y":364,"wires":[["8a5ad3c6.cf3ad"]]},{"id":"64df6204.e24c4c","type":"debug","z":"39a9affc.48f19","name":"","active":true,"console":"false","complete":"false","x":484,"y":360,"wires":[]}]
```

### Artik PWM Node

Sets the PWM settings on the available PWM pins of Artik board. User can set the following settings  in the config tab:
* **Pin:** sets the PWM pin to opperate on, this could be either pin 0 or 1.
* **Duty cycle:** sets the duty cycle of the pin in nanosecond. 
* **Period:** sets the period of the pin in nanosecond.
* **State:** sets the state of the pin, either set as high or low. 

For this node, users can also overwrite the settings with `msg.payload` for duty cycle, period and state. The format would be:
* `msg.payload.dutyCycle`
* `msg.payload.period`
* `msg.payload.state`

For example, to over write the settings in the config tab, insert a function node in the flow above consists of the following:

```
  msg.payload = {
      dutyCycle: 500000000,
      period: 1000000000,
      state: 1
  }
  return msg;
```

Just like the Artik Out node, users can also set the initial output of the PWM pin right after the flow is deployed. Simply check **Set initial state?**, and the config tab will prompt the user for initial state, initial duty cycle and the initial period.

Here is an example flow with the PWM configs, and an function node to overwrite the settings of the PWM configs.

```
[{"id":"20da7925.b926b6","type":"artik_pwm","z":"39a9affc.48f19","name":"","pin":"0","dutyCycle":"50000000","period":"100000000","state":"0","enableInitialState":true,"initialState":"1","initialDutyCycle":"600000000","initialPeriod":"900000000","x":547,"y":470,"wires":[]},{"id":"7936730d.c546bc","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":178,"y":470,"wires":[["20da7925.b926b6"]]},{"id":"cac628d7.5d52f8","type":"inject","z":"39a9affc.48f19","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":166,"y":531,"wires":[["a0f68053.1eaaf"]]},{"id":"a0f68053.1eaaf","type":"function","z":"39a9affc.48f19","name":"over write PWM pin","func":"msg.paylaod={\n    dutyCycle: 100000000,\n    period: 1000000000,\n    state: 1\n}\nreturn msg;","outputs":1,"noerr":0,"x":363,"y":532,"wires":[["20da7925.b926b6"]]}]
```


