import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import {
  unsubscribeTopic,
  subscribeTopic,
  connectMQTT,
  disconnectMQTT,
} from "@/store/actions/mqttAction";
import {
  selectMessagesByTopic,
  selectSortedDatesByTopic,
} from "@/store/selectors/mqttSelector";
import SentSvg from "@/components/svg/sentSvg";
import PendingSvg from "@/components/svg/pendingSvg";
import { messageAdded, simulateReconnection } from "@/store/slices/mqttSlice";
import DotsVerticalSvg from "@/components/svg/dotsVerticalSvg";
import { MQTT_HOST, MQTT_CLIENT_ID } from "@/utils/contants";

function ChatRoomPage() {
  const dispatch = useDispatch();
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { isConnected } = useSelector((state) => state.mqtt);
  const { room } = useSelector((state) => state.auth);
  // Lấy messages theo topic
  const groupedMessages = useSelector((state) =>
    selectMessagesByTopic(state, room?.topic)
  );

  // Lấy các ngày khác nhau có message
  // Sắp xếp ngày theo thứ tự tăng dần
  const sortedDates = useSelector((state) =>
    selectSortedDatesByTopic(state, room?.topic)
  );

  const username = room?.displayName;

  // Xử lý click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động scroll đến cuối chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Gửi tin nhắn
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault(); // Thêm dòng này để ngăn reload trang
      if (!newMessage.trim()) return;

      const message = {
        sender: username,
        text: newMessage,
        id: nanoid(8),
        status: "pending",
        timestamp: new Date(new Date().getTime() + 86400000).toISOString(),
      };

      dispatch(messageAdded({ topic: room?.topic, message }));
      setNewMessage("");
      setUserHasScrolled(false); // Reset flag khi user tự gửi
      scrollToBottom();
    },
    [dispatch, newMessage, username, room?.topic, scrollToBottom]
  );

  // Rời phòng chat
  const handleLeaveChat = useCallback(() => {
    dispatch(unsubscribeTopic(room?.topic));
  }, [dispatch, room?.topic]);

  // Kiểm tra vị trí scroll
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setIsNearBottom(isBottom);

      // Nếu user tự scroll thì set flag
      if (!isBottom) setUserHasScrolled(true);
    }
  }, []);

  // Thêm event listener scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Tự động scroll chỉ khi ở gần bottom hoặc user gửi tin nhắn
  useEffect(() => {
    if (isNearBottom || !userHasScrolled) {
      scrollToBottom();
    }
  }, [isNearBottom, userHasScrolled, scrollToBottom]);

  // Kết nối MQTT
  useEffect(() => {
    dispatch(connectMQTT(MQTT_HOST, MQTT_CLIENT_ID));

    return () => {
      dispatch(disconnectMQTT());
    };
  }, [dispatch]);

  // Subscribe topic khi kết nối thành công
  useEffect(() => {
    if (isConnected) {
      dispatch(subscribeTopic(room?.topic));
    }
  }, [dispatch, room?.topic, isConnected]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-2xl mx-auto py-4 min-h-screen">
        <div
          className="bg-white rounded-lg shadow-sm flex flex-col"
          style={{ height: "calc(100vh - 2rem)" }}
        >
          {/* Render header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chat Room: {room?.roomName}
              </h1>
              <div className="flex items-center mt-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span className="ml-2 text-sm text-gray-600">
                  {isConnected ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <DotsVerticalSvg className="w-6 h-6" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50">
                  <button
                    onClick={handleLeaveChat}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <span>Leave Room</span>
                  </button>
                  <button
                    onClick={() => dispatch(simulateReconnection(10000))}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <span>Reconnect (10s)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Render messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50"
          >
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center justify-center my-6">
                  <span className="mx-4 text-sm text-gray-500 font-medium">
                    {date}
                  </span>
                </div>

                {groupedMessages[date].map((msg) => {
                  let isCurrentUser = msg.sender === username;
                  let isSent = msg.status === "sent";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white"
                            : "bg-white shadow-sm"
                        } ${
                          isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
                        } relative`}
                      >
                        {!isCurrentUser && (
                          <div className="text-xs font-medium mb-1 text-gray-700">
                            {msg.sender}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap break-words max-w-full">
                          {msg.text}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span
                            className={`text-[12px] ${
                              isCurrentUser ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isCurrentUser && (
                            <span className="inline-flex translate-y-[1px]">
                              {isSent ? <SentSvg /> : <PendingSvg />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Render message input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-gray-50 border-t border-gray-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

ChatRoomPage.propTypes = {
  topic: PropTypes.string,
  username: PropTypes.string,
};

export default ChatRoomPage;
