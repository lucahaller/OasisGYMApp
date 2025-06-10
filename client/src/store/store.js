// src/store/store.js
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../reducers"; // ✅ IMPORT del index.js de reducers

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
