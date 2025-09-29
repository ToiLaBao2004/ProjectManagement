import React from "react";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: any;
  isUser: boolean;
  timestamp: Date;
  system?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  timestamp,
  system = false,
}) => {
  const renderMessage = () => {
    if (Array.isArray(message)) {
      if (message.length === 0) {
        return (
          <p className="text-sm">
            Không có dữ liệu để hiển thị.
          </p>
        );
      }

      return (
        <div className="overflow-x-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono bg-black/20 p-3 rounded-lg">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
      );
    }

    if (typeof message === "object" && message !== null) {
      return (
        <div className="overflow-x-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono bg-black/20 p-3 rounded-lg">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
      );
    }

    return <p className="text-sm leading-relaxed">{message}</p>;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
          ${isUser 
            ? "bg-gradient-to-br from-message-user to-blue-600" 
            : system 
              ? "bg-gradient-to-br from-message-system to-yellow-500"
              : "bg-gradient-to-br from-message-bot to-gray-700"
          }
        `}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message bubble */}
        <div className={`
          relative rounded-2xl px-4 py-3 transition-all duration-300
          ${isUser 
            ? "bg-gradient-to-br from-message-user to-blue-600 text-message-user-foreground rounded-br-md" 
            : system 
              ? "bg-gradient-to-br from-message-system to-yellow-500 text-message-system-foreground rounded-bl-md"
              : "bg-gradient-to-br from-message-bot to-gray-700 text-message-bot-foreground rounded-bl-md"
          }
          shadow-lg hover:shadow-xl
        `}>
          {renderMessage()}
          
          {/* Timestamp */}
          <div className={`
            text-xs mt-2 opacity-70
            ${isUser ? "text-right" : "text-left"}
          `}>
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};