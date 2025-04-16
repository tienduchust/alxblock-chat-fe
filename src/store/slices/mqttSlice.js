import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // mặc định dùng localStorage
import { persistReducer } from "redux-persist";
import { MQTT_CONNECT, MQTT_DISCONNECT } from "../actions/mqttAction";
import { MQTT_CLIENT_ID, MQTT_HOST } from "@/utils/contants";

const initialState = {
  isConnected: false,
  messages: {
    /* 
    Cấu trúc:

    [topic]: {
      [dateString]: [
        { 
          id: string,
          sender: string,
          text: string,
          timestamp: string,
          status: 'pending' | 'sent' | 'failed'
        }
      ]
    }
    */
  },
  pendingMessages: {},
  error: null,
};

const mqttSlice = createSlice({
  name: "mqtt",
  initialState,
  reducers: {
    // Xử lý khi kết nối thành công
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.error = null;
    },
    // Xử lý khi kết nối bị mất
    connectionLost: (state) => {
      state.isConnected = false;
    },
    // Xử lý khi kết nối thất bại
    connectionFailed: (state, action) => {
      state.error = action.payload;
    },
    // Xử lý message nhận được từ MQTT
    messageReceived: (state, action) => {
      const { topic, message } = action.payload;
      const date = new Date(message.timestamp).toLocaleDateString();

      state.messages = {
        ...state.messages,
        [topic]: {
          ...state.messages[topic],
          [date]: [
            // Lọc bỏ message trùng ID (nếu có)
            ...(state.messages[topic]?.[date] || []).filter(
              (m) => m.id !== message.id
            ),
            { ...message, status: "sent" },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        },
      };
      // Xóa message chưa được gửi đi theo ID trong topic tương ứng
      if (state.pendingMessages[topic]) {
        delete state.pendingMessages[topic][message.id];

        // Xóa topic nếu không còn message pending
        if (Object.keys(state.pendingMessages[topic]).length === 0) {
          delete state.pendingMessages[topic];
        }
      }
    },
    // Xử lý message được thêm vào khi user input
    messageAdded: (state, action) => {
      const { topic, message } = action.payload;
      const date = new Date(message.timestamp).toLocaleDateString();
      state.pendingMessages[topic] = {
        ...state.pendingMessages[topic],
        [message.id]: message,
      };
      state.messages = {
        ...state.messages,
        [topic]: {
          ...state.messages[topic],
          [date]: [...(state.messages[topic]?.[date] || []), message].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          ),
        },
      };
    },
  },
});

export const {
  connectionEstablished,
  connectionLost,
  messageReceived,
  topicSubscribed,
  connectionFailed,
  messageAdded,
} = mqttSlice.actions;

const mqttPersistConfig = {
  key: "mqtt",
  storage,
  blacklist: ["isConnected", "error", "subscribedTopics"], // Không lưu trạng thái kết nối
};

export default persistReducer(mqttPersistConfig, mqttSlice.reducer);

// Thêm action type mới
export const SIMULATE_RECONNECT = "mqtt/simulateReconnect";

// Trong file testHelpers.js
export const simulateReconnection =
  (delay = 5000) =>
  (dispatch) => {
    // 1. Ngắt kết nối
    dispatch({ type: MQTT_DISCONNECT });

    // 2. Xóa trạng thái kết nối
    dispatch(connectionLost());

    // 3. Kết nối lại sau delay
    setTimeout(() => {
      dispatch({
        type: MQTT_CONNECT,
        payload: { host: MQTT_HOST, clientId: MQTT_CLIENT_ID },
      });
    }, delay);
  };
