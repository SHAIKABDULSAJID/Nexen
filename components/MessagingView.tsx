import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chat, User } from "../types";
import { INITIAL_CHATS, INITIAL_POSTS } from "../constants";
import {
  Search,
  Send,
  Phone,
  Video,
  Info,
  MoreVertical,
  ChevronLeft,
} from "lucide-react";
import { getAvatarSrc } from "../utils/avatar";

interface MessagingViewProps {
  onBack?: () => void;
  currentUser: User;
  authToken?: string | null;
  prefillUser?: User | null;
  onPrefillHandled?: () => void;
}

const timestampToMs = (timestamp: string): number => {
  const directDate = Date.parse(timestamp);
  if (!Number.isNaN(directDate)) return directDate;

  const timeMatch = timestamp.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (timeMatch) {
    const [, hourStr, minuteStr, meridian] = timeMatch;
    let hours = Number(hourStr) % 12;
    if (meridian.toUpperCase() === "PM") hours += 12;
    const minutes = Number(minuteStr);
    const now = new Date();
    const parsed = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0,
    );
    return parsed.getTime();
  }

  const relativeMatch = timestamp.match(/^(\d+)\s*([mhd])\s*ago$/i);
  if (relativeMatch) {
    const [, valueStr, unit] = relativeMatch;
    const value = Number(valueStr);
    const unitToMs = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    } as const;
    return (
      Date.now() - value * unitToMs[unit.toLowerCase() as keyof typeof unitToMs]
    );
  }

  return 0;
};

const getLastChatActivity = (chat: Chat): number => {
  const latestTimestamp = chat.messages[chat.messages.length - 1]?.timestamp;
  if (!latestTimestamp) return 0;
  return timestampToMs(latestTimestamp);
};

const toDateFromTimestamp = (timestamp: string): Date => {
  const directDate = new Date(timestamp);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  const millis = timestampToMs(timestamp);
  return new Date(millis || Date.now());
};

const formatMessageTime = (timestamp: string): string => {
  const date = toDateFromTimestamp(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getMessageDayKey = (timestamp: string): string => {
  const date = toDateFromTimestamp(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const formatMessageDateLabel = (timestamp: string): string => {
  const date = toDateFromTimestamp(timestamp);
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (dateKey === todayKey) return "Today";
  if (dateKey === yesterdayKey) return "Yesterday";

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dedupeChatsByParticipant = (chatList: Chat[]): Chat[] => {
  const seenParticipants = new Set<string>();
  const result: Chat[] = [];

  for (const chat of chatList) {
    const participantId = chat.participant?.id;
    if (!participantId) continue;
    if (seenParticipants.has(participantId)) continue;

    seenParticipants.add(participantId);
    result.push(chat);
  }

  return result;
};

const MessagingView: React.FC<MessagingViewProps> = ({
  onBack,
  currentUser,
  authToken,
  prefillUser,
  onPrefillHandled,
}) => {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    INITIAL_CHATS[0]?.id ?? null,
  );
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [isMessagesScrolling, setIsMessagesScrolling] = useState(false);
  const scrollFadeTimerRef = useRef<number | null>(null);

  const followers = useMemo(() => {
    const usersById = new Map<string, (typeof INITIAL_POSTS)[number]["user"]>();
    for (const post of INITIAL_POSTS) {
      if (!usersById.has(post.user.id)) {
        usersById.set(post.user.id, post.user);
      }
      for (const comment of post.commentList) {
        if (!usersById.has(comment.user.id)) {
          usersById.set(comment.user.id, comment.user);
        }
      }
    }

    return (currentUser.followerIds || [])
      .map((id) => usersById.get(id))
      .filter((user): user is NonNullable<typeof user> => Boolean(user));
  }, [currentUser.followerIds]);

  const recentChats = useMemo(
    () =>
      chats
        .filter((chat) => chat.messages.length > 0)
        .sort((a, b) => getLastChatActivity(b) - getLastChatActivity(a)),
    [chats],
  );

  const activeChat = chats.find((c) => c.id === selectedChatId);

  const authHeaders = useMemo(
    () =>
      authToken
        ? {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          }
        : null,
    [authToken],
  );

  const fetchChats = async (keepSelection = true) => {
    if (!authHeaders) return;

    try {
      setIsLoadingChats(true);
      setChatsError(null);

      const response = await fetch("/api/chats", {
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const apiChats: Chat[] = await response.json();
      const normalizedChats = dedupeChatsByParticipant(apiChats);
      setChats(normalizedChats);

      if (!keepSelection) {
        setSelectedChatId(normalizedChats[0]?.id || null);
      } else if (
        selectedChatId &&
        !normalizedChats.some((chat) => chat.id === selectedChatId)
      ) {
        setSelectedChatId(normalizedChats[0]?.id || null);
      }
    } catch (error) {
      console.error("Load chats error:", error);
      setChatsError("Could not load chats right now.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    if (!authHeaders) return;
    fetchChats(false);
  }, [authHeaders]);

  useEffect(() => {
    if (!authHeaders) return;

    const pollId = window.setInterval(() => {
      fetchChats(true);
    }, 4000);

    return () => window.clearInterval(pollId);
  }, [authHeaders, selectedChatId]);

  const startOrOpenChat = async (targetUser: User) => {
    const existingChat = chats.find(
      (chat) => chat.participant.id === targetUser.id,
    );
    if (existingChat) {
      setSelectedChatId(existingChat.id);
      return;
    }

    if (!authHeaders) return;

    try {
      const response = await fetch("/api/chats/start", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ targetUserId: targetUser.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to start chat");
      }

      const createdChat: Chat = await response.json();
      setChats((prevChats) =>
        dedupeChatsByParticipant([createdChat, ...prevChats]),
      );
      setSelectedChatId(createdChat.id);
    } catch (error) {
      console.error("Start chat error:", error);
      setChatsError("Could not open this chat.");
    }
  };

  const startChatWithFollower = (followerId: string) => {
    const follower = followers.find((user) => user.id === followerId);
    if (!follower) return;

    startOrOpenChat(follower);
  };

  useEffect(() => {
    if (!prefillUser) return;

    startOrOpenChat(prefillUser);
    onPrefillHandled && onPrefillHandled();
  }, [prefillUser, onPrefillHandled, chats, authHeaders]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !authHeaders) return;

    const sendMessage = async () => {
      const messageText = newMessage.trim();

      try {
        const response = await fetch(`/api/chats/${activeChat.id}/messages`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ text: messageText }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const updatedChat: Chat = await response.json();

        setChats((prevChats) => {
          const otherChats = prevChats.filter(
            (chat) => chat.id !== updatedChat.id,
          );
          return dedupeChatsByParticipant([updatedChat, ...otherChats]);
        });
        setSelectedChatId(updatedChat.id);
        setNewMessage("");
      } catch (error) {
        console.error("Send message error:", error);
        setChatsError("Message failed to send.");
      }
    };

    sendMessage();
  };

  const handleMessagesScroll = () => {
    setIsMessagesScrolling(true);

    if (scrollFadeTimerRef.current !== null) {
      window.clearTimeout(scrollFadeTimerRef.current);
    }

    scrollFadeTimerRef.current = window.setTimeout(() => {
      setIsMessagesScrolling(false);
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (scrollFadeTimerRef.current !== null) {
        window.clearTimeout(scrollFadeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="md:col-span-12 lg:col-span-9 h-full min-h-0 flex bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-colors duration-300">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-72 xl:w-80 border-r border-slate-200 dark:border-white/10 flex flex-col h-full min-h-0 bg-slate-50 dark:bg-white/5">
        <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors border border-slate-200 dark:border-white/10"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            )}
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Messages
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-none rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoadingChats && (
            <p className="px-4 pt-3 text-xs text-slate-500 dark:text-slate-400">
              Loading chats...
            </p>
          )}
          {chatsError && (
            <p className="px-4 pt-3 text-xs text-rose-500">{chatsError}</p>
          )}

          <div className="px-4 pt-4 pb-2">
            <h3 className="text-xs font-black tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
              Followers
            </h3>
          </div>

          {followers.map((follower) => {
            const existingChat = chats.find(
              (chat) => chat.participant.id === follower.id,
            );
            const isSelected =
              existingChat !== undefined && selectedChatId === existingChat.id;

            return (
              <div
                key={follower.id}
                onClick={() => startChatWithFollower(follower.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
                  isSelected
                    ? "bg-white dark:bg-white/10 border-blue-600 dark:border-blue-500"
                    : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={getAvatarSrc(follower.avatar)}
                    className="w-11 h-11 rounded-xl object-cover"
                    alt={follower.name}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">
                    {follower.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {follower.role || "Follower"}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="px-4 pt-4 pb-2 border-t border-slate-200 dark:border-white/10 mt-1">
            <h3 className="text-xs font-black tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
              Recent Chats
            </h3>
          </div>

          {recentChats.length > 0 ? (
            recentChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedChatId === chat.id
                    ? "bg-white dark:bg-white/10 border-blue-600 dark:border-blue-500"
                    : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={getAvatarSrc(chat.participant.avatar)}
                    className="w-12 h-12 rounded-xl object-cover"
                    alt={chat.participant.name}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3
                      className={`text-sm font-bold truncate ${selectedChatId === chat.id ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {chat.participant.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                      {chat.messages[chat.messages.length - 1]?.timestamp
                        ? formatMessageTime(
                            chat.messages[chat.messages.length - 1].timestamp,
                          )
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400">
              No recent chats yet. Start a conversation with a follower.
            </p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-900/50 relative">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarSrc(activeChat.participant.avatar)}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                  alt={activeChat.participant.name}
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                    {activeChat.participant.name}
                  </h3>
                  <p className="text-[10px] text-green-600 dark:text-green-500 font-bold">
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-slate-400 mx-auto">
                <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Info className="w-5 h-5" />
                </button>
                <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div
              onScroll={handleMessagesScroll}
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth"
            >
              {activeChat.messages.map((msg, index) => {
                const currentDay = getMessageDayKey(msg.timestamp);
                const previousDay =
                  index > 0
                    ? getMessageDayKey(activeChat.messages[index - 1].timestamp)
                    : null;
                const showDateSeparator =
                  index === 0 || currentDay !== previousDay;

                return (
                  <React.Fragment key={msg.id}>
                    {showDateSeparator && (
                      <div className="sticky top-2 z-[1] self-center h-0 overflow-visible">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-200/90 dark:bg-slate-700/80 text-slate-600 dark:text-slate-200 backdrop-blur-sm transition-opacity duration-300 ${isMessagesScrolling ? "opacity-100" : "opacity-0"}`}
                        >
                          {formatMessageDateLabel(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex flex-col max-w-[70%] ${msg.senderId === currentUser.id ? "ml-auto items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.senderId === currentUser.id
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-white/10 text-slate-800 dark:text-white rounded-tl-none border border-slate-200 dark:border-transparent"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`mt-1 text-[10px] text-right ${
                            msg.senderId === currentUser.id
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                    {/* Add emoji or attachment icons here if desired */}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-full mb-4">
              <Send className="w-12 h-12 text-slate-300 dark:text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
              Your Messages
            </h3>
            <p className="text-sm max-w-xs mt-2 text-slate-500">
              Connect with founders, investors, and fellow builders. Select a
              conversation to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingView;
