package com.example.gardenmonitorsystem;

import androidx.appcompat.app.AppCompatActivity;

import android.hardware.SensorManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;

public class MainActivity extends AppCompatActivity {



    private static final String TAG = "MainActivity";
    static String MQTTHOST = "tcp://mqtt.eclipse.org:1883"; //Online MQTT Broker
    //static String MQTTHOST = "tcp://broker.hivemq.com:1883"; //Online MQTT Broker host
    //static String MQTTHOST = "tcp://192.168.1.12:5000";
    static String USERNAME = ""; //MQTT Username
    static String PASSWORD = ""; //MQTT Password
    static String lightTopic = "garden/monitor/system/light"; //MQTT Light sensor topic
    static String moistureTopic = "garden/monitor/system/moisture"; //MQTT moisture sensor topic
    static String pumpTopic = "garden/monitor/system/pump"; //MQTT pump topic


    private String pumpState = "off"; //initial value for pump

    MqttAndroidClient client;

    Button btnPump;

    TextView lightValueTxt;
    TextView moistureVallueTxt;

    MqttConnectOptions options;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        lightValueTxt = findViewById(R.id.lightValueTxt); //light sensor textview
        moistureVallueTxt =findViewById(R.id.moistureValueTxt); //soil moisture sesnor textview
        btnPump = findViewById(R.id.btnPump);

        String clientId = MqttClient.generateClientId(); //generate MQTT client id

        client = new MqttAndroidClient(this.getApplicationContext(), MQTTHOST, clientId);
        
        try{
            
            IMqttToken token = client.connect(); //conect to the MQTT broker
            token.setActionCallback(new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.d(TAG, "onSuccess: Connected to broker");
                    setSubscription(); //when connection to the MQTT broker susccess subscribe to the topic
                    Toast.makeText(MainActivity.this, "Connected to the broker", Toast.LENGTH_LONG).show(); //display the toast when connection to the broker is success

                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.d(TAG, "onFailure: Connection to broker failed");
                    Toast.makeText(MainActivity.this, "Connection to the broker failed", Toast.LENGTH_LONG).show(); //display to the broker when connection to the broker is failed
                }
            });
            
        }catch (MqttException e){
            e.printStackTrace();
        }

        client.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                if(topic.equals(lightTopic)) {
                    //if topic equal to light sensor topic set text in light sesnor textview with the mqtt message
                    lightValueTxt.setText(new String(message.getPayload()) + " lux");
                }else if(topic.equals(moistureTopic)){
                    //if topic equal to soil moisture sensor topic set text in soil moisture sensor textview with the mqtt message
                    moistureVallueTxt.setText(new String(message.getPayload()) + " %");
                }
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {

            }
        });

        turnPump(); //call the turnPump() function
    
    }

    private void turnPump(){
        //function to turn on/off pump
        btnPump.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(pumpState == "off"){
                    //if the current value of pump state is "off" change it to On
                    pumpState = "on";
                }
                else if(pumpState == "on"){
                    //if the current value of pump state is "on" change it to Off
                    pumpState = "off";
                }

                String topic = pumpTopic; //set the publish topic
                String message = pumpState; //set the message
                try {
                    client.publish(topic, message.getBytes(), 0, false); //publish the message on the specified topic
                    Toast.makeText(MainActivity.this,message, Toast.LENGTH_LONG).show(); //dsiplay the published message as a toast
                    if(pumpState == "off"){
                        btnPump.setText("Turn On Pump");
                    }else if(pumpState == "on"){
                        btnPump.setText("Turn Off Pump");
                    }
                } catch (MqttException e) {
                    e.printStackTrace();
                }

            }
        });
    }

    private void setSubscription(){
        //function to subscribe to the topic in MQTT Broker
        try{
            client.subscribe(lightTopic, 0); //susbscribe to Light sensor topic to the broker
            client.subscribe(moistureTopic, 0); //susbscribe to Soil Moisture sensor topic to the broker
        }catch(MqttException e){
            e.printStackTrace();
        }
    }


}