import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // mặc định dùng localStorage
import { persistReducer } from "redux-persist";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isJoinedRoom: false,
    room: null,
  },
  reducers: {
    joinRoom: (state, action) => {
      state.isJoinedRoom = true;
      state.room = {
        roomName: action.payload.roomName,
        displayName: action.payload.displayName,
        password: action.payload.password,
        // Tạo topic dựa trên roomName và password
        topic: `chat/${action.payload.roomName}-${action.payload.password}`
      };
      state.loading = false;
    },
    leaveRoom: (state) => {
      state.isJoinedRoom = false;
      state.room = null;
    },
  },
  extraReducers: (builder) => {
    // Xử lý sau khi rehydrate state từ persist
    builder.addCase("persist/REHYDRATE", (state, action) => {
      if (action?.payload?.room) {
        state.isJoinedRoom = true;
        state.room = action.payload.room;
      }
    });
  },
});

export const { joinRoom, leaveRoom } = authSlice.actions;

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["room"],
  blacklist: ["isJoinedRoom", "error", "loading"], // Không lưu trạng thái kết nối
};

export default persistReducer(authPersistConfig, authSlice.reducer);


