This is a simple node module that performs the following tasks on Artik board:
1) Setup an OUT GPIO pin, able to start with initial state, can also be overwritten with msg.payload.
2) Setup an IN GPIO pin, able to read interrupt
3) Setup an ADC GPIO pin, able to read between 0~1.8V
4) Setup and PWM GPIO pin, able to start with initial state, can also be overwritten with msg.payload.

## To install:
Enter:
```
          npm install node-red-contrib-artik
```
on your Artik board.

Instruction of each node can be found in the according info tab. 

## NOTE: 
due to the different hardware configuration on different versions of the Artik board, users should look up the physical pin value from the Artik pin mapping.