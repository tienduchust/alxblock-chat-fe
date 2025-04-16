import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import authReducer from "./slices/authSlice";
import mqttReducer from "./slices/mqttSlice";
import mqttMiddleware from "./middlewares/mqttMiddleware";


const rootReducer = combineReducers({
  mqtt: mqttReducer,
  auth: authReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(mqttMiddleware),
});

export const persistor = persistStore(store);
