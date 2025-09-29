import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Bot, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ConfirmationBar } from "./ConfirmationBar";

const API_URL = "http://localhost:8000";

interface Message {
  id: string;
  content: any;
  isUser: boolean;
  system?: boolean;
  timestamp: Date;
}

export const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastBotMessage, setLastBotMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: any, isUser: boolean, system = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      system,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async (message: string) => {
    setLoading(true);
    addMessage(message, true);

    try {
      const response = await axios.post(`${API_URL}/text2query`, {
        prompt: message,
      });
      const botResponse = response.data;
      addMessage(botResponse, false);
      setLastBotMessage(botResponse);
      setShowConfirmation(true);
    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMessage =
        err.response?.data?.message ||
        "⚠️ Không thể gửi tin nhắn. Vui lòng thử lại.";
      addMessage(errorMessage, false, true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.post(`${API_URL}/confirm_query`, {
        is_confirm: true,
      });

      if (response.status === 200) {
        addMessage("✅ Đã xác nhận kết quả truy vấn.", false, true);
        setShowConfirmation(false);
      } else {
        throw new Error("Xác nhận thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Error confirming query:", err);
      const errorMessage =
        err.response?.data?.message || "⚠️ Không thể xác nhận truy vấn.";
      addMessage(errorMessage, false, true);
    }
  };

  const handleReject = async (newPrompt: string) => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/confirm_query`, {
        is_confirm: false,
        new_prompt: newPrompt,
      });

      if (response.status === 200) {
        addMessage(newPrompt, true);
        if (response.data) {
          addMessage(response.data, false);
          setLastBotMessage(response.data);
        }
        addMessage("✅ Câu truy vấn mới đã được gửi.", false, true);
        // Keep confirmation bar visible for further editing or confirmation
      } else {
        throw new Error("Gửi câu truy vấn mới thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Error rejecting query:", err);
      const errorMessage =
        err.response?.data?.message || "⚠️ Không thể gửi câu truy vấn mới.";
      addMessage(errorMessage, false, true);
    } finally {
      setLoading(false);
      // Don't hide confirmation bar - allow unlimited edits
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-message-user" size={48} />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="
        bg-gradient-to-r from-chat-header to-chat-background
        border-b border-input-border
        shadow-[var(--shadow-header)]
        px-6 py-4
      ">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="
                w-12 h-12 rounded-xl
                bg-gradient-to-br from-message-user to-blue-600
                flex items-center justify-center
                shadow-lg
              ">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Text2Query Bot</h1>
                <p className="text-sm text-muted-foreground">
                  Trợ lý chuyển đổi văn bản thành truy vấn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare size={20} />
              <span className="text-sm font-medium">{messages.length} tin nhắn</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden bg-chat-background">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="
                  w-20 h-20 rounded-2xl mb-6
                  bg-gradient-to-br from-message-user to-blue-600
                  flex items-center justify-center
                  shadow-xl
                ">
                  <Bot className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Chào mừng đến với Text2Query
                </h2>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Tôi có thể giúp bạn chuyển đổi các câu hỏi thành truy vấn. 
                  Hãy bắt đầu bằng cách nhập câu hỏi của bạn.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    system={message.system}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className={`${showConfirmation ? 'pb-32' : ''} transition-all duration-300`}>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={showConfirmation || loading}
          isLoading={loading}
        />
      </div>

      {/* Confirmation Bar */}
      {showConfirmation && (
        <ConfirmationBar
          onConfirm={handleConfirm}
          onReject={handleReject}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};