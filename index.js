const express = require('express');
const mqtt = require('mqtt');


const app = express();


app.get('/',(req,res)=>{
    res.send('hello world');
});

var port = process.env.PORT || 3000
app.listen(port ,(res,req)=>{
    
    console.log(`listen port on ${port}`);
});



let vcap_services = JSON.parse(process.env.VCAP_SERVICES);

// Start Config
var config    = {};
config.mqtt   = {};

/** Modify this config ***/
// SYS
config.timeout = 120 * 1000;
//service name in wise-Paas
config.mqtt.serviceName = "p-rabbitmq-innoworks";

if (process.env.VCAP_SERVICES != null) {
    console.log("Using VCAP_SERVICES");
    let vcap_services = JSON.parse(process.env.VCAP_SERVICES);
}

// Parsing credentials from VCAP_SERVICES for binding service
if(vcap_services[config.mqtt.serviceName]){
    console.log("Parsing "+config.mqtt.serviceName);
    config.mqtt.broker		= "mqtt://" + vcap_services[config.mqtt.serviceName][0].credentials.protocols.mqtt.host;
    config.mqtt.username	= vcap_services[config.mqtt.serviceName][0].credentials.protocols.mqtt.username.trim();
    config.mqtt.password	= vcap_services[config.mqtt.serviceName][0].credentials.protocols.mqtt.password.trim();
    config.mqtt.port		= vcap_services[config.mqtt.serviceName][0].credentials.protocols.mqtt.port;
}

config.mqtt.options = {
	broker: config.mqtt.broker,
	reconnectPeriod: 1000,
	port: config.mqtt.port,
	username: config.mqtt.username,
	password: config.mqtt.password
};




config.mqtt.topic		= "/#";
config.mqtt.retain		= true; // MQTT Publish Retain



// Start MQTT
var client = mqtt.connect(config.mqtt.broker,config.mqtt.options);

client.on('connect', function () {
    client.subscribe(config.mqtt.topic);
    console.log("[MQTT]:", "Connected.");
});
 
client.on('message', function (topic, message) {
  console.log("[" + topic + "]:" + message.toString());
});

client.on('error', function(err) {
    console.log(err);
});

client.on('close', function() {
    console.log("[MQTT]: close");
});

client.on('offline', function() {
    console.log("[MQTT]: offline");
});