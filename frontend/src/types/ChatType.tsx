
interface Message {
  id: string;
  content: any;
  isUser: boolean;
  system?: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: any;
  isUser: boolean;
  timestamp: Date;
  system?: boolean;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface ConfirmationBarProps {
  onConfirm: () => void;
  onReject: (newPrompt: string) => void;
  onClose: () => void;
}