import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="border-t border-input-border bg-chat-background p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập câu truy vấn của bạn..."
            disabled={disabled || isLoading}
            className="
              h-12 px-4 rounded-xl
              bg-input-bg border-input-border
              focus:ring-message-user
            "
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          size="icon"
          className="
            h-12 w-12 rounded-xl
            bg-gradient-to-r from-message-user to-blue-600
            text-message-user-foreground
            hover:from-blue-600 hover:to-message-user
            shadow-lg hover:shadow-xl
          "
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </Button>
      </form>
    </div>
  );
};