#include <ESP8266WiFi.h> //include esp library
#include <PubSubClient.h> //include mqtt library

#define lightPin D1 //light sensor vcc pin
int lightValue; // light sensor raw value
int moistureValue; // moisture sensor raw value
#define soilMoisturePin D2 // soil moisture sensor vcc pin
#define sensorValue A0 //multiplexed pin for ligt sensor and mositure sensor
#define relay D7 //relay pin


//Enter wifi credentials
const char* ssid = "WIFI_SSID"; //WIFI SSID  
const char* password =  "WIFI_PASSWORD"; //WIDI PASSWORD
 
//Enter mqtt server configurations
const char* mqttServer = "mqtt.eclipse.org";
//const char* mqttServer = "broker.hivemq.com"; //MQTT online Broker
//const char* mqttServer = "192.168.1.12"; //MQTT Local Broker
const int mqttPort = 1883;//MQTT Online Broker Port number
//const int mqttPort = 5000; //MQTT local broker port number
const char* mqttUser = ""; //MQTT Username
const char* mqttPassword = ""; //MQTT Password

WiFiClient espClient;
PubSubClient client(espClient);

const int dry = 500; // value for dry sensor of soil moisture
const int wet = 250; // value for wet sensor of soil moisture

String light_str; //variable to hold string converted light value
char light[50]; //array to hold light value message package
String moisture_str; //variable to hold string converted moisture value
char moisture[50]; //array to hold moisture value message package

void setup()
{ 
  Serial.begin(9600);
  digitalWrite(relay,HIGH);

  //Make the connection to the WIFI
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.print("Connected to WiFi :");
  Serial.println(WiFi.SSID());

 //Make Connection to the MQTT Broker
  client.setServer(mqttServer, mqttPort); //connect to the MQTT broker
  client.setCallback(MQTTcallback); //call the MQTT callback function
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
 
    if (client.connect("ESP8266", mqttUser, mqttPassword )) {
 
      Serial.println("connected");  
 
    } else {
 
      Serial.print("failed with state ");
      Serial.println(client.state());  //If you get state 5: mismatch in configuration
      delay(2000);
 
    }
 
   }

  //sensor pinmode
  pinMode(relay, OUTPUT);
  pinMode(lightPin, OUTPUT);
  pinMode(soilMoisturePin, OUTPUT);
  pinMode(sensorValue, INPUT);

   client.subscribe("garden/monitor/system/pump");
}

void MQTTcallback(char* topic, byte* payload, unsigned int length) {
  //MQTT Callback function
 
  Serial.print("Message arrived in topic: ");
  Serial.println(topic); //display the subcribed message when message is coming
 
  Serial.print("Message:"); //display the message

  String message;
  for (int i = 0; i < length; i++) {
    message = message + (char)payload[i];  //Conver *byte to String
  }
   Serial.print(message);
  if(message == "off") {digitalWrite(relay,HIGH);}   //turn the pump off
  if(message == "on") {digitalWrite(relay,LOW);} //turn the pump on
 
  Serial.println();
  Serial.println("-----------------------");  
}

void loop()
{
  client.loop(); //Loop connection MQTT Broker
  
  digitalWrite(lightPin, HIGH);
  delay(100);
  //read raw value from the sensor
  lightValue = analogRead(sensorValue );
  //light sensor calculation
  double Vout=lightValue*0.0048828125;
  int lux=(2500/Vout-500)/10;
  //package the light sensor value
  light_str = String(lux);
  light_str.toCharArray(light, light_str.length() + 1);
  //publish the package of light sensor value to the broker
  client.publish("garden/monitor/system/light", light);
  digitalWrite(lightPin, LOW);

  digitalWrite(soilMoisturePin, HIGH);
  delay(100);
  //read raw value drom the sesnor
  moistureValue = analogRead(sensorValue); 
  //moisture sensor value calculation
  int percentageHumidity = map(moistureValue, wet, dry, 0, 100);
  //package the sensor value
  moisture_str = String(percentageHumidity);
  moisture_str.toCharArray(moisture, moisture_str.length() + 1);
  //publish the package of the soil moisture sensor value to the broker
  client.publish("garden/monitor/system/moisture", moisture); 
  digitalWrite(soilMoisturePin, LOW);

  //Serial print the sesnor value
  Serial.print("Light: ");
  Serial.println(lux);
  //Serial.println(lightValue); //light raw value
  Serial.print("Soil Moisture : ");
  Serial.println(percentageHumidity);
  //Serial.println(moistureValue); //Soil Moisture raw value

  delay(1000); //publish sensor value to the MQTT broker every one second


  

}
