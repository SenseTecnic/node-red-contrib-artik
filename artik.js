var fs = require('fs');
var path = require('path');
var nodefn = require('when/node');

module.exports = function(RED) {

  function artikNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;

    this.on('input', function(msg){     

      if (msg.payload.direction === 'out'){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/export", msg.payload.pin).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ msg.payload.pin +"/direction", msg.payload.direction);
        }).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ msg.payload.pin +"/value", msg.payload.value);
        }).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/gpio/unexport", msg.payload.pin);
        }).then(function(){
          node.send(msg);
        }).otherwise(function(err){
          return node.error(RED._("node-red-contrib-artik.error.unexport-error"));
        });
      } else if (msg.payload.direction === 'in'){
        return nodefn.call(fs.writeFile, "/sys/class/gpio/export", msg.payload.pin).then(function(){
          return nodefn.call(fs.writeFile, "/sys/class/gpio/gpio"+ msg.payload.pin +"/direction", msg.payload.direction);
        }).then(function(){
          return nodefn.call(fs.readFile, "/sys/class/gpio/gpio"+ msg.payload.pin +"/value");
        }).then(function(data){
          msg.payload.value = data.toString('ascii', 0, 1);
          msg.topic = "";
          return nodefn.call(fs.writeFile, "/sys/class/gpio/unexport", msg.payload.pin);
        }).then(function(){
          node.send(msg);
        }).otherwise(function(err){
          return node.error(RED._("node-red-contrib-artik.error.unexport-error"));
        });
      } else {
        msg.payload = {
          error: "direction is not specified"
        };
        node.send(msg);
      }      
    });  
  }
  RED.nodes.registerType("artik",artikNode);
}

