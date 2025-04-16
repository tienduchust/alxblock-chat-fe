import { createSelector } from "@reduxjs/toolkit";


const EMPTY_OBJECT = {};
/**
 * Select messages by topic
 * @param {*} state
 * @param {*} topic
 * @returns
 */
export const selectMessagesByTopic = createSelector(
  [
    (state) => state.mqtt.messages, // Lấy toàn bộ messages từ state
    (_, topic) => topic, // Nhận topic làm tham số
  ],
  (messages, topic) => messages[topic] || EMPTY_OBJECT // Trả về cùng reference nếu không có thay đổi
);


/**
 * Select sorted dates by topic
 * @param {*} state
 * @param {*} topic
 * @returns
 */
export const selectSortedDatesByTopic = createSelector(
  [selectMessagesByTopic],
  (grouped) => {
    return Object.keys(grouped || {}).sort(
      (a, b) =>
        new Date(a.split("/").reverse().join("-")) -
        new Date(b.split("/").reverse().join("-"))
    );
  }
);
