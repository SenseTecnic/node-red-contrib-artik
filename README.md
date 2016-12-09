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

User can also set the **Initial State** of a GPIO pin when flows are deployed. Simply check **Set initial state?** in the config tab, the node will prompt the user for the initial state.

For detail usages of the node, please refer to our tutorial on [this link](http://developers.sensetecnic.com/article/tutorial-controlling-an-artik-board-using-fred-and-node-red/).

### Artik In Node

Reads the value of a GPIO pin in the **in** direction. Pin number can be set in the config tab. 
When an the node is triggered( for example, an inject node), the node will read the value of the specified GPIO pin, and returns `msg.payload.value` indicating the status of the pin. 1 means a HIGH, and 0 means a LOW. `msg.payload.interrupt` would indicates if this msg was triggered by the interrupt action or not. 

This Artik In Node can also read interrupt from a GPIO pin. By checking **Enable interrupt?**, the config tab will prompt the user for the edge to detect, and the debounce delay.

* **Set edge:** users can seletect which edge to set the interrupt, either the rising edge, falling edge, or both of them.
* **Debounce delay:** users can set the debounce delay for each detection in milliseconds.

Note that when in interrupt mode, user can still use the inject node to trigger manual reading of the GPIO status. 

For detail usages of the node, please refer to our tutorial on [this link](http://developers.sensetecnic.com/article/tutorial-controlling-an-artik-board-using-fred-and-node-red/).


### Artik ADC Node

Reads the value of an ADC pin and shows the value in mV. Please refer to [Artik document](https://developer.artik.io/documentation/developer-guide/gpio/kernel-gpio.html) to find out the ADC reading range supported on your Artik board. 

In the config tab, you can set the pin number of the ADC pin on your board( either 0 or 1), and also the select the platform of the board you are using. When the node is triggered( for example, an inject node), the node will read the ADC value on the specified pin and return the value in mV. 

For detail usages of the node, please refer to our tutorial on [this link](http://developers.sensetecnic.com/article/tutorial-controlling-an-artik-board-using-fred-and-node-red/).

### Artik PWM Node

Sets the PWM settings on the available PWM pins of Artik board. User can set the following settings  in the config tab:
* **Pin:** sets the PWM pin to opperate on, this could be either pin 0 or 1.
* **Duty cycle:** sets the duty cycle of the pin in nanosecond. 
* **Period:** sets the period of the pin in nanosecond.
* **State:** sets the state of the pin, either set as high or low. 

Note that maximun limit for period(ns) and dutycycle(ns) is 1000,000,000 and dutycycle should always be less than period.

For this node, users can also overwrite the settings with `msg.payload` for duty cycle, period and state. The format would be:
* `msg.payload.dutyCycle`
* `msg.payload.period`
* `msg.payload.state`

Just like the Artik Out node, users can also set the initial output of the PWM pin right after the flow is deployed. Simply check **Set initial state?**, and the config tab will prompt the user for initial state, initial duty cycle and the initial period.

For detail usages of the node, please refer to our tutorial on [this link](http://developers.sensetecnic.com/article/tutorial-controlling-an-artik-board-using-fred-and-node-red/).


