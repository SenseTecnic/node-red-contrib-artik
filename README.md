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

Sets the value of a GPIO pin in the **out** direction. Pin number and platform version can be set in the config tab, and the state can be set in the config tab, or be overwritten by the incoming `msg.payload.state` with value 0 for LOW, and 1 for HIGH. At the moment, this Artik Out node is set to always active high.

For example, to over write the settings in the config tab, insert a function node in the flow above consists of the following:

```
  msg.payload = {
      state: 1
  }
  return msg;
```

Here is an example flow that has the node configured to turn pin #13 on Artik 10 HIGH, and there is also an incoming `msg.payload` that turns the pin LOW.


```
  [{"id":"2d11caeb.2fcf56","type":"inject","z":"5e22ab64.dd8dd4","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":163,"y":80,"wires":[["fdd95c75.d797b"]]},{"id":"fdd95c75.d797b","type":"artik_out","z":"5e22ab64.dd8dd4","name":"","pin":"pin13","platform":"10","state":"1","enableInitialState":"","initialState":"","x":385,"y":88,"wires":[]},{"id":"7e274296.1f0dfc","type":"function","z":"5e22ab64.dd8dd4","name":"off","func":"var newMsg = {\n    payload:{\n        state:0\n    }\n}\nreturn newMsg;","outputs":1,"noerr":0,"x":289,"y":166,"wires":[["fdd95c75.d797b"]]},{"id":"8411fbe4.bfbcf8","type":"inject","z":"5e22ab64.dd8dd4","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":147,"y":167,"wires":[["7e274296.1f0dfc"]]}]
```

User can also set the **Initial State** of a GPIO pin when flows are deployed. Simply check **Set initial state?** in the config tab, the node will prompt the user for the initial state.

Here is an example flow similar to the example above but with the initial state setting configured to HIGH.

```
  [{"id":"c3f864ff.9065b8","type":"inject","z":"c6f9147c.f77198","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":156,"y":100,"wires":[["81a158e5.69eea8"]]},{"id":"81a158e5.69eea8","type":"artik_out","z":"c6f9147c.f77198","name":"","pin":"pin13","platform":"10","state":"1","enableInitialState":true,"initialState":"1","x":378,"y":108,"wires":[]},{"id":"b910700b.0b3df","type":"function","z":"c6f9147c.f77198","name":"off","func":"var newMsg = {\n    payload:{\n        state:0\n    }\n}\nreturn newMsg;","outputs":1,"noerr":0,"x":282,"y":186,"wires":[["81a158e5.69eea8"]]},{"id":"4ac95129.05282","type":"inject","z":"c6f9147c.f77198","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":140,"y":187,"wires":[["b910700b.0b3df"]]}]
```

### Artik In Node

Reads the value of a GPIO pin in the **in** direction. Pin number can be set in the config tab. 
When an the node is triggered( for example, an inject node), the node will read the value of the specified GPIO pin, and returns `msg.payload.value` indicating the status of the pin. 1 means a HIGH, and 0 means a LOW. `msg.payload.interrupt` would indicates if this msg was triggered by the interrupt action or not. Here is an example for reading on pin #13 on Artik 10:

```
  [{"id":"dfa80a.abb887f8","type":"artik_in","z":"335aeac4.e996d6","name":"","pin":"pin13","platform":"10","enableInterrupt":"","edge":"","debounce":"","x":291,"y":98,"wires":[["873367d1.aa69b8"]]},{"id":"abfd103d.d8a6a","type":"inject","z":"335aeac4.e996d6","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":112,"y":90,"wires":[["dfa80a.abb887f8"]]},{"id":"873367d1.aa69b8","type":"debug","z":"335aeac4.e996d6","name":"","active":true,"console":"false","complete":"false","x":476,"y":95,"wires":[]}]
```

This Artik In Node can also read interrupt from a GPIO pin. By checking **Enable interrupt?**, the config tab will prompt the user for the edge to detect, and the debounce delay.

* **Set edge:** users can seletect which edge to set the interrupt, either the rising edge, falling edge, or both of them.
* **Debounce delay:** users can set the debounce delay for each detection in milliseconds.

Note that when in interrupt mode, user can still use the inject node to trigger manual reading of the GPIO status. 


### Artik ADC Node

Reads the value of an ADC pin and shows the value in mV. Please refer to [Artik document](https://developer.artik.io/documentation/developer-guide/gpio/kernel-gpio.html) to find out the ADC reading range supported on your Artik board. 

In the config tab, you can set the pin number of the ADC pin on your board( either 0 or 1), and also the select the platform of the board you are using. When the node is triggered( for example, an inject node), the node will read the ADC value on the specified pin and return the value in mV. Here is an example flow.

```
  [{"id":"4fa6be54.b8857","type":"artik_adc","z":"1d85c180.d3d9af","name":"","pin":"0","platform":"artik_10","x":301,"y":99,"wires":[["38bca321.2268bc"]]},{"id":"1861425e.36325e","type":"inject","z":"1d85c180.d3d9af","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":115,"y":94,"wires":[["4fa6be54.b8857"]]},{"id":"38bca321.2268bc","type":"debug","z":"1d85c180.d3d9af","name":"","active":true,"console":"false","complete":"false","x":471,"y":90,"wires":[]}]
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
[{"id":"1662b3e3.2d1e2c","type":"artik_pwm","z":"53870a7f.17e8f4","name":"","pin":"0","dutyCycle":"50000000","period":"100000000","state":"0","enableInitialState":true,"initialState":"1","initialDutyCycle":"600000000","initialPeriod":"900000000","x":505,"y":85,"wires":[]},{"id":"9ac3f57e.97a1e8","type":"inject","z":"53870a7f.17e8f4","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":136,"y":85,"wires":[["1662b3e3.2d1e2c"]]},{"id":"9311de67.a9b02","type":"inject","z":"53870a7f.17e8f4","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":124,"y":146,"wires":[["baa6d984.9be328"]]},{"id":"baa6d984.9be328","type":"function","z":"53870a7f.17e8f4","name":"over write PWM pin","func":"msg.paylaod={\n    dutyCycle: 100000000,\n    period: 1000000000,\n    state: 1\n}\nreturn msg;","outputs":1,"noerr":0,"x":321,"y":147,"wires":[["1662b3e3.2d1e2c"]]}]
```


