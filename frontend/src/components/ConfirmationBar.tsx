import React, { useState } from "react";
import { CheckCircle, Edit3, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface ConfirmationBarProps {
  onConfirm: () => void;
  onReject: (newPrompt: string) => void;
  onClose: () => void;
}

export const ConfirmationBar: React.FC<ConfirmationBarProps> = ({
  onConfirm,
  onReject,
  onClose,
}) => {
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleReject = () => {
    if (showRejectionInput) {
      if (newPrompt.trim()) {
        onReject(newPrompt.trim());
        setNewPrompt("");
        setShowRejectionInput(false);
        setError(null);
      } else {
        setError("⚠️ Prompt mới không được để trống.");
      }
    } else {
      setShowRejectionInput(true);
    }
  };

  const handleConfirm = () => {
    try {
      onConfirm();
      setError(null);
    } catch (error) {
      setError("⚠️ Đã xảy ra lỗi khi xác nhận.");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="
        bg-gradient-to-r from-confirmation-background to-blue-600
        text-confirmation-foreground
        shadow-[var(--shadow-confirmation)]
        border-t border-blue-400/30
      ">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-medium">Xác nhận kết quả truy vấn</span>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-confirmation-foreground hover:bg-white/20 h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mb-3">
              <span className="text-sm">{error}</span>
            </div>
          )}

          {showRejectionInput ? (
            <div className="flex gap-3 items-center">
              <Input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Nhập câu truy vấn mới..."
                className="
                  flex-1 px-3 py-2 rounded-lg
                  bg-white/20 border-white/30
                  text-confirmation-foreground placeholder:text-white/70
                  focus:ring-white/50
                "
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newPrompt.trim()) {
                    handleReject();
                  }
                }}
              />
              <Button
                onClick={handleReject}
                disabled={!newPrompt.trim()}
                variant="outline"
                className="
                  bg-white/20 hover:bg-white/30
                  text-confirmation-foreground border-white/30
                "
              >
                Gửi
              </Button>
              <Button
                onClick={() => setShowRejectionInput(false)}
                variant="ghost"
                className="
                  text-confirmation-foreground hover:bg-white/20
                "
              >
                Hủy
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleReject}
                variant="outline"
                className="
                  text-confirmation-foreground hover:bg-white/20
                  border-white/30
                "
              >
                <Edit3 size={16} className="mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                onClick={handleConfirm}
                className="
                  bg-white/20 hover:bg-white/30
                  text-confirmation-foreground border-white/30
                "
              >
                <CheckCircle size={16} className="mr-2" />
                Xác nhận
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};