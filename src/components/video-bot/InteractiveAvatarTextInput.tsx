import { Input, Spinner, Tooltip } from "@nextui-org/react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { Mic, MicOff, Paperclip,  } from "lucide-react";
import clsx from "clsx";
import React from "react";

interface StreamingAvatarTextInputProps {
  label: string;
  placeholder: string;
  input: string;
  onSubmit: () => void;
  setInput: (value: string) => void;
  handleVoiceIconClick: () => void;
  isVoiceMode: boolean;
  endContent?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

// Reusable Voice Mode Toggle Button
const VoiceToggleButton = ({
  isVoiceMode,
  onClick,
}: {
  isVoiceMode: boolean;
  onClick: () => void;
}) => (
  <Tooltip content={isVoiceMode ? "Disable Voice Mode" : "Enable Voice Mode"} className="bg-black text-white">
    <button
      onClick={onClick}
      aria-label={isVoiceMode ? "Disable Voice Mode" : "Enable Voice Mode"}
      className={clsx(
        "focus:outline-none p-2 rounded-lg transition-all duration-200 hover:scale-105",
        isVoiceMode 
          ? "bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      {isVoiceMode ? (
        <Mic className="text-purple-600 dark:text-purple-400" size={20} />
      ) : (
        <MicOff className="text-gray-400" size={20} />
      )}
    </button>
  </Tooltip>
);

// Reusable Send Button with Loading State
const SendButton = ({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) => (
  <Tooltip content="Send message" className="bg-black text-white">
    {loading ? (
      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
        <Spinner size="sm" className="text-purple-600" />
      </div>
    ) : (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Send message"
        className={clsx(
          "focus:outline-none p-2 rounded-lg transition-all duration-200",
          disabled 
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" 
            : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 hover:scale-105 shadow-lg"
        )}
      >
        <PaperPlaneRight
          className={clsx(
            disabled ? "text-gray-400" : "text-white"
          )}
          size={20}
        />
      </button>
    )}
  </Tooltip>
);



export default function InteractiveAvatarTextInput({
  label,
  placeholder,
  input,
  onSubmit,
  setInput,
  handleVoiceIconClick,
  isVoiceMode,
  endContent,
  disabled = false,
  loading = false,
}: StreamingAvatarTextInputProps) {
  // Submit Handler
  const handleSubmit = () => {
    if (input.trim() === "") return;
    onSubmit();
    setInput("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 p-4">
          
          
          {/* Input Field */}
          <div className="flex-1">
            <Input
              label={label}
              placeholder={placeholder}
              value={input}
              size="lg"
              onValueChange={setInput}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              isDisabled={disabled}
              aria-label={label || "Message input"}
              className="text-gray-900 dark:text-gray-100"
              classNames={{
                input: "text-base placeholder:text-gray-500 dark:placeholder:text-gray-400",
                inputWrapper: "border-none shadow-none bg-transparent hover:bg-transparent group-data-[focus=true]:bg-transparent",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Voice Toggle Button */}
            <VoiceToggleButton
              isVoiceMode={isVoiceMode}
              onClick={handleVoiceIconClick}
            />

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

            {/* Additional Custom End Content */}
            {endContent}

            {/* Send Button */}
            <SendButton
              onClick={handleSubmit}
              loading={loading}
              disabled={disabled || input.trim() === ""}
            />
          </div>
        </div>
        
        {/* Status Indicator */}
        {isVoiceMode && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Voice mode active
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
