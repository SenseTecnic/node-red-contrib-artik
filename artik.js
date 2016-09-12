var fs = require('fs');
var path = require('path');



module.exports = function(RED) {
  //test if is artik



  function artikNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;

    this.on('input', function(msg){
      console.log(msg.payload.direction);
      console.log(typeof(msg.payload.direction));
      
      try {
        if(typeof(msg.payload.direction) !== 'undefinded'){
          if (msg.payload.direction == 'out'){
            fs.writeFile("/sys/class/gpio/export", msg.payload.pin, function(){
              fs.writeFile("/sys/class/gpio/gpio"+ msg.payload.pin +"/direction", msg.payload.direction, function(){
                fs.writeFile("/sys/class/gpio/gpio"+ msg.payload.pin +"/value", msg.payload.value, function(){
                  fs.writeFile("/sys/class/gpio/unexport", msg.payload.pin, function(){
                    console.log(msg);
                    node.send(msg);
                  })
                })
              })
            })
          }
          if (msg.payload.direction == 'in'){
            fs.writeFile("/sys/class/gpio/export", msg.payload.pin, function(){
              fs.writeFile("/sys/class/gpio/gpio"+ msg.payload.pin +"/direction", msg.payload.direction, function(){
                fs.readFile("/sys/class/gpio/gpio"+ msg.payload.pin +"/value", function read(err, data){
                  console.log(data.toString('ascii', 0, 1));
                  msg.payload.value = data.toString('ascii', 0, 1);
                  fs.writeFile("/sys/class/gpio/unexport", msg.payload.pin, function(){
                    console.log(msg);
                    node.send(msg);
                  })
                })
              })
            })   
          }
        } else {
          msg.payload = {
            error: "direction is not specified"
          }
        }
      } catch (err){
        console.log("catch err " + err);
      }
    });  
  }
  RED.nodes.registerType("artik",artikNode);
}