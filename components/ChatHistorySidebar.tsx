import React from 'react';
import { ChatSessionSummary } from '../types';

interface ChatHistorySidebarProps {
  isSidebarOpen: boolean;
  chatList: ChatSessionSummary[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isSidebarOpen,
  chatList,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => {
  
  const sortedChatList = [...chatList].sort((a, b) => {
    const dateA = new Date(a.lastUpdatedAt);
    const dateB = new Date(b.lastUpdatedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      onDeleteChat(id);
    }
  };

  return (
    <div
      className={`bg-slate-800 flex flex-col h-full border-r border-slate-700 shrink-0 transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'w-64 md:w-72 p-4' : 'w-0 p-0 overflow-hidden'}`}
      aria-hidden={!isSidebarOpen}
    >
      {isSidebarOpen && (
        <>
          <button
            onClick={onNewChat}
            className="w-full mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-150 text-sm font-medium flex items-center justify-center space-x-2"
            aria-label="Start a new chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span>New Chat</span>
          </button>
          <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
            {sortedChatList.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No chats yet. Start a new one!</p>
            )}
            {sortedChatList.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-150 ease-in-out group ${
                  activeChatId === chat.id
                    ? 'bg-black text-slate-100 shadow-md'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:shadow-md'
                }`}
                role="button"
                aria-pressed={activeChatId === chat.id}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectChat(chat.id);}}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow overflow-hidden">
                    <h3 className="text-sm font-medium truncate" title={chat.title}>{chat.title}</h3>
                    <p className={`text-xs ${activeChatId === chat.id ? 'text-slate-300' : 'text-slate-400'} truncate`}>
                      {new Date(chat.lastUpdatedAt).toLocaleDateString()} {new Date(chat.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className={`ml-2 p-1 rounded hover:bg-red-500 hover:text-white ${
                      activeChatId === chat.id ? 'text-slate-300 hover:bg-red-400' : 'text-slate-400 group-hover:text-slate-300'
                    } opacity-50 group-hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-red-400 transition-opacity`}
                    aria-label={`Delete chat titled ${chat.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.177-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.84.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHistorySidebar;