import React from 'react';
import { Message, Sender, Part } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  const renderPart = (part: Part, index: number) => {
    if (part.text) {
      return (
        <p key={`text-${index}`} className="whitespace-pre-wrap break-words text-sm md:text-base">
          {part.text}
        </p>
      );
    }
    if (part.inlineData) {
      const { mimeType, data, fileName } = part.inlineData;
      if (mimeType.startsWith('image/')) {
        return (
          <div key={`file-${index}-${fileName}`} className="my-2">
            <p className="text-xs italic text-slate-300 mb-1">{fileName}</p>
            <img
              src={`data:${mimeType};base64,${data}`}
              alt={fileName}
              className="max-w-xs max-h-64 rounded-lg border border-slate-500 object-contain"
            />
          </div>
        );
      } else {
        return (
          <div key={`file-${index}-${fileName}`} className="my-2 p-2 bg-slate-600 rounded-md">
            <p className="text-xs font-medium text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block mr-1 align-text-bottom">
                <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 0-1.06-1.06l-.497.5a1.5 1.5 0 0 1-2.122-2.122l7-7a1.5 1.5 0 0 1 2.122 0A1.5 1.5 0 0 1 15.621 8.5l-2.47 2.47a.75.75 0 1 0 1.06 1.06L16.68 9.56a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
              </svg>
              {fileName}
            </p>
            <p className="text-xs text-slate-300">{mimeType}</p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow-md ${
          isUser
            ? 'bg-gray-600 text-slate-100 rounded-br-none'
            : 'bg-slate-700 text-slate-100 rounded-bl-none'
        }`}
      >
        {message.parts.map(renderPart)}
        <p className={`text-xs mt-1 ${isUser ? 'text-slate-400' : 'text-slate-400'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;