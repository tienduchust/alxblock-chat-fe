export const MQTT_CONNECT = "mqtt/connect";
export const MQTT_DISCONNECT = "mqtt/disconnect";
export const MQTT_SUBSCRIBE = "mqtt/subscribe";
export const MQTT_UNSUBSCRIBE = "mqtt/unsubscribe";
export const MQTT_PUBLISH = "mqtt/publish";


export const connectMQTT = (host, clientId) => ({
  type: MQTT_CONNECT,
  payload: { host, clientId },
});

export const disconnectMQTT = () => ({
  type: MQTT_DISCONNECT,
});

export const subscribeTopic = (topic) => ({
  type: MQTT_SUBSCRIBE,
  payload: topic,
});

export const unsubscribeTopic = (topic) => ({
  type: MQTT_UNSUBSCRIBE,
  payload: topic,
});
