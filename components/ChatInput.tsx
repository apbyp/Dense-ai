import React, { useState, useRef, useEffect, ChangeEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  isLoading: boolean;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 25; // Approximate limit for inline data with Gemini (total request size matters)

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const remainingSlots = MAX_FILES - selectedFiles.length;
      
      let filesToAdd: File[] = [];
      let alertMessage = "";

      newFiles.slice(0, remainingSlots).forEach(file => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alertMessage += `${file.name} is too large (max ${MAX_FILE_SIZE_MB}MB).\n`;
        } else {
          filesToAdd.push(file);
        }
      });

      if (newFiles.length > remainingSlots && filesToAdd.length < newFiles.length) {
         alertMessage += `You can select up to ${MAX_FILES} files. Some files were not added.\n`;
      }
      
      if (alertMessage) {
        alert(alertMessage.trim());
      }

      setSelectedFiles(prevFiles => [...prevFiles, ...filesToAdd]);
      
      // Reset file input to allow selecting the same file again if removed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || selectedFiles.length > 0) && !isLoading) {
      onSendMessage(inputValue.trim(), selectedFiles);
      setInputValue('');
      setSelectedFiles([]);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = parseInt(textareaRef.current.style.maxHeight, 10) || 120;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  return (
    <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-slate-800 border-t border-slate-700 sticky bottom-0">
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map(file => (
            <div key={file.name} className="bg-slate-600 text-slate-100 text-xs px-2 py-1 rounded-full flex items-center">
              <span>{file.name.length > 20 ? `${file.name.substring(0,17)}...` : file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                className="ml-2 text-slate-300 hover:text-white"
                aria-label={`Remove ${file.name}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || selectedFiles.length >= MAX_FILES}
          aria-label="Attach files"
          className="p-3 text-slate-400 hover:text-gray-400 rounded-lg disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 self-end"
           style={{ height: '48px', width: '48px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:w-6 mx-auto">
            <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a2.75 2.75 0 1 0 3.889 3.889l10.94-10.94a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M8.243 10.828a2.75 2.75 0 1 1 3.889 3.889l-3.268 3.268a4.25 4.25 0 0 1-6.01-6.01l7.404-7.404a5.75 5.75 0 0 1 8.132 8.132L9.36 20.7a.75.75 0 0 1-1.06-1.061l8.652-8.652a4.25 4.25 0 0 0-6.01-6.01l-7.404 7.404a2.75 2.75 0 0 0 3.889 3.889l3.268-3.268Z" clipRule="evenodd" />
          </svg>
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/plain,.doc,.docx,.csv,.json,.xml,audio/*,video/*" // Example accept list
          disabled={selectedFiles.length >= MAX_FILES}
        />
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={isLoading ? "Waiting for AI or chat selection..." : "Type your message or add files..."}
          className="flex-grow p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none outline-none transition-shadow duration-150 text-sm md:text-base placeholder-slate-400 disabled:opacity-70 disabled:cursor-not-allowed"
          rows={1}
          disabled={isLoading}
          style={{ maxHeight: '120px', minHeight: '48px', overflowY: 'auto' }}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
          aria-label="Send message"
          className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 self-end"
          style={{ height: '48px', width: '48px' }}
        >
          {isLoading && (!inputValue.trim() && selectedFiles.length === 0) ? (
            <svg className="animate-spin h-5 w-5 md:h-6 md:w-6 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:w-6 mx-auto">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;