import React, { useEffect, useState } from "react";
import { TRENDING_NEWS } from "../constants";
import { TrendingUp, ExternalLink, RefreshCcw, Loader2 } from "lucide-react";
import Logo from "./Logo";
import { getAvatarSrc } from "../utils/avatar";
import { User } from "../types";

interface RightPanelProps {
  currentUserId: string;
  followingMap: Record<string, boolean>;
  onToggleFollow: (userId: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  currentUserId,
  followingMap,
  onToggleFollow,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);
  const [showAllFounders, setShowAllFounders] = useState(false);
  const [suggestedFounders, setSuggestedFounders] = useState<User[]>([]);
  const [isLoadingFounders, setIsLoadingFounders] = useState(false);

  const displayedNews = showAllNews ? TRENDING_NEWS : TRENDING_NEWS.slice(0, 3);
  const displayedFounders = showAllFounders
    ? suggestedFounders
    : suggestedFounders.slice(0, 3);

  const loadSuggestedFounders = async () => {
    setIsLoadingFounders(true);
    try {
      const response = await fetch("/api/users/search");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = (await response.json()) as User[];
      const filtered = users.filter((u) => u.id !== currentUserId);
      setSuggestedFounders(filtered);
    } catch (error) {
      console.error("Error fetching suggested founders:", error);
      setSuggestedFounders([]);
    } finally {
      setIsLoadingFounders(false);
    }
  };

  useEffect(() => {
    loadSuggestedFounders();
  }, [currentUserId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSuggestedFounders().finally(() => {
      setTimeout(() => setIsRefreshing(false), 300);
    });
  };

  const handleNewsClick = (title: string) => {
    alert(`Opening news: ${title}`);
  };

  return (
    <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 self-start">
      {/* Trending News */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/20 duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Tech News
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            className={`text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all ${isRefreshing ? "rotate-180 scale-110" : ""}`}
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="space-y-5">
          {displayedNews.map((news, idx) => (
            <div
              key={news.id}
              onClick={() => handleNewsClick(news.title)}
              className={`group cursor-pointer animate-in fade-in slide-in-from-top-${(idx + 1) * 2} duration-300`}
            >
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                {news.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                <span>{news.source}</span>
                <span>•</span>
                <span>{news.time}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllNews(!showAllNews)}
          className="w-full mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
        >
          {showAllNews ? "Show less" : "Show more news"}
          <ExternalLink
            className={`w-3 h-3 transition-transform ${showAllNews ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Suggested Founders */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/20 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Suggested Founders
          </h3>
          <button
            onClick={handleRefresh}
            className={`text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all ${isRefreshing ? "rotate-180 scale-110" : ""}`}
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="space-y-4">
          {isLoadingFounders ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loading founders...
            </p>
          ) : displayedFounders.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No founders found in database.
            </p>
          ) : (
            displayedFounders.map((founder, idx) => (
              <Suggestion
                key={founder.id}
                userId={founder.id}
                name={founder.name}
                role={[founder.role, founder.company]
                  .filter(Boolean)
                  .join(" @ ")}
                avatar={founder.avatar}
                isFollowing={followingMap[founder.id]}
                onToggle={() => onToggleFollow(founder.id)}
                className={`animate-in fade-in slide-in-from-bottom-${(idx + 1) * 2} duration-300`}
              />
            ))
          )}
        </div>
        <button
          onClick={() => setShowAllFounders(!showAllFounders)}
          className="w-full mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
        >
          {showAllFounders ? "View less" : "View all suggested"}
        </button>
      </div>

      {/* Footer Links */}
      <div className="px-4 text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 font-medium">
        <div className="w-full mb-4">
          <Logo className="h-6" textColor="text-blue-600 dark:text-white" />
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Redirecting to About");
          }}
          className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          About
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Redirecting to Accessibility");
          }}
          className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Accessibility
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Redirecting to Help Center");
          }}
          className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Help Center
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Redirecting to Privacy & Terms");
          }}
          className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Privacy & Terms
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Redirecting to Ad Choices");
          }}
          className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Ad Choices
        </a>
        <p className="w-full mt-2">© 2024 NEXEN. Built for Tech Ecosystem.</p>
      </div>
    </div>
  );
};

const Suggestion: React.FC<{
  userId: string;
  name: string;
  role: string;
  avatar: string;
  isFollowing?: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ name, role, avatar, isFollowing, onToggle, className }) => (
  <div className={`flex items-center justify-between ${className}`}>
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="relative group shrink-0">
        <img
          src={getAvatarSrc(avatar)}
          className="w-9 h-9 rounded-lg shrink-0 object-cover border border-slate-200 dark:border-white/10 shadow-sm transition-transform group-hover:scale-105"
          alt={name}
        />
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 rounded-lg transition-all" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
          {role}
        </p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all shrink-0 border ${
        isFollowing
          ? "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
          : "text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  </div>
);

export default RightPanel;
