import mqtt from "mqtt";

import {
  connectionEstablished,
  messageReceived,
  connectionLost,
  connectionFailed,
  messageAdded,
} from "../slices/mqttSlice";
import {
  MQTT_CONNECT,
  MQTT_SUBSCRIBE,
  MQTT_DISCONNECT,
  MQTT_UNSUBSCRIBE,
} from "../actions/mqttAction";
import { leaveRoom } from "../slices/authSlice";
import { decryptMessage, encryptMessage } from "@/utils/helpers";

let mqttClient = null;

const mqttMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case MQTT_CONNECT: {
      if (!mqttClient) {
        const { host, clientId } = action.payload;
        mqttClient = mqtt.connect(host, {
          clientId,
          keepalive: 60,
          clean: true,
          reconnectPeriod: 1000,
        });

        mqttClient.on("connect", () => {
          store.dispatch(connectionEstablished());
        });

        mqttClient.on("message", (topic, message) => {
          store.dispatch(
            messageReceived({
              topic,
              message: JSON.parse(decryptMessage(message.toString())),
            })
          );
        });

        mqttClient.on("error", (error) => {
          store.dispatch(connectionFailed(error.message));
        });

        mqttClient.on("close", () => {
          store.dispatch(connectionLost());
        });
      }
      break;
    }
    case MQTT_SUBSCRIBE: {
      if (mqttClient && store.getState().mqtt.isConnected) {
        mqttClient.subscribe(action.payload, (error) => {
          if (!error) {
            const { pendingMessages } = store.getState().mqtt;
            Object.keys(pendingMessages).forEach((topic) => {
              if (pendingMessages[topic]) {
                Object.keys(pendingMessages[topic]).forEach((id) => {
                  const message = pendingMessages[topic][id];
                  mqttClient.publish(
                    topic,
                    encryptMessage(JSON.stringify(message))
                  );
                });
              }
            });
          }
        });
      }
      break;
    }
    case MQTT_UNSUBSCRIBE: {
      if (mqttClient && store.getState().mqtt.isConnected) {
        mqttClient.unsubscribe(action.payload, (err) => {
          if (!err) {
            // Sau khi unsubscribe thành công, dispatch action leaveRoom
            store.dispatch(leaveRoom(action.payload));
          }
        });
      }
      break;
    }
    case MQTT_DISCONNECT: {
      if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
      }
      break;
    }
    case messageAdded.type: {
      const { topic, message } = action.payload;
      const { isConnected } = store.getState().mqtt;

      // Nếu client đã kết nối thì publish message
      if (isConnected && mqttClient) {
        mqttClient.publish(topic, encryptMessage(JSON.stringify(message)));
      }
      break;
    }
  }

  return next(action);
};

export default mqttMiddleware;
