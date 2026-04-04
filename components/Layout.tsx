import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Plus,
  Home as HomeIcon,
  MessageSquare,
  LogOut,
  User as UserIcon,
  ChevronDown,
  X,
  Sun,
  Moon,
  Settings,
  Star,
  HelpCircle,
} from "lucide-react";
import Logo from "./Logo";
import { User, Post } from "../types";
import { getAvatarSrc } from "../utils/avatar";

interface LayoutProps {
  children: React.ReactNode;
  activeTab:
    | "home"
    | "chats"
    | "community"
    | "discover"
    | "saved"
    | "ai-assistant"
    | "launchpad";
  onTabChange: (
    tab: "home" | "chats" | "saved" | "ai-assistant" | "launchpad",
  ) => void;
  onLogout: () => void;
  currentUser: User;
  posts: Post[];
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenSettings?: () => void;
  onOpenPremium?: () => void;
  onUserClick?: (user: User) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onLogout,
  currentUser,
  posts,
  theme,
  toggleTheme,
  onOpenSettings,
  onOpenPremium,
  onUserClick,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    posts: Post[];
  }>({ users: [], posts: [] });
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearch(true);

    if (query.trim() === "") {
      setSearchResults({ users: [], posts: [] });
      return;
    }

    try {
      // Fetch users from API
      const usersResponse = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
      );
      const users = await usersResponse.json();

      const lowerQuery = query.toLowerCase();

      // Search Posts
      const matchedPosts = posts.filter((post) =>
        post.content.toLowerCase().includes(lowerQuery),
      );

      setSearchResults({
        users: users || [],
        posts: matchedPosts,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      // Fallback to local search if API fails
      const lowerQuery = query.toLowerCase();
      const matchedUsers = new Map<string, User>();
      posts.forEach((post) => {
        if (
          post.user.name.toLowerCase().includes(lowerQuery) ||
          post.user.username.toLowerCase().includes(lowerQuery)
        ) {
          matchedUsers.set(post.user.id, post.user);
        }
      });

      const matchedPosts = posts.filter((post) =>
        post.content.toLowerCase().includes(lowerQuery),
      );

      setSearchResults({
        users: Array.from(matchedUsers.values()),
        posts: matchedPosts,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden transition-colors duration-300">
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-200/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none z-0" />

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-lg transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="cursor-pointer" onClick={() => onTabChange("home")}>
              <Logo className="h-10" />
            </div>
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={async () => {
                    setShowSearch(true);
                    // Fetch all users when search is focused but empty
                    if (searchQuery.trim() === "") {
                      try {
                        const usersResponse = await fetch("/api/users/search");
                        const users = await usersResponse.json();
                        setSearchResults({
                          users: users || [],
                          posts: [],
                        });
                      } catch (error) {
                        console.error("Error fetching users:", error);
                      }
                    }
                  }}
                  placeholder="Search startups, builders..."
                  className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full w-72 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults({ users: [], posts: [] });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearch && searchQuery && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                  {searchResults.users.length === 0 &&
                  searchResults.posts.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No results found
                    </div>
                  ) : (
                    <>
                      {searchResults.users.length > 0 && (
                        <div className="p-2">
                          <h3 className="px-2 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            People
                          </h3>
                          {searchResults.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                              onClick={() => {
                                setShowSearch(false);
                                if (onUserClick) onUserClick(user);
                              }}
                            >
                              <img
                                src={getAvatarSrc(user.avatar)}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.users.length > 0 &&
                        searchResults.posts.length > 0 && (
                          <div className="h-px bg-slate-200 dark:bg-white/10 mx-2" />
                        )}

                      {searchResults.posts.length > 0 && (
                        <div className="p-2">
                          <h3 className="px-2 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Posts
                          </h3>
                          {searchResults.posts.map((post) => (
                            <div
                              key={post.id}
                              className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                              onClick={() => {
                                setShowSearch(false);
                                if (onUserClick) onUserClick(post.user);
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src={getAvatarSrc(post.user.avatar)}
                                  alt={post.user.name}
                                  className="w-4 h-4 rounded-full"
                                />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {post.user.name}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {post.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <img
                    src={getAvatarSrc(currentUser.avatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl z-10 py-2">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 mb-1 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                      >
                        <img
                          src={getAvatarSrc(currentUser.avatar)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          @{currentUser.username}
                        </p>
                      </div>
                    </div>

                    <div className="py-1 border-b border-slate-200 dark:border-white/10">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onUserClick) onUserClick(currentUser);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> View Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (onOpenPremium) onOpenPremium();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Star className="w-4 h-4" /> Upgrade to Premium
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" /> Help & Support
                      </button>
                    </div>

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main
        className={`flex-1 ${activeTab === "chats" || activeTab === "ai-assistant" ? "max-w-7xl" : "max-w-6xl"} mx-auto w-full px-4 py-6 md:grid md:grid-cols-12 md:gap-6 relative z-10 ${activeTab === "chats" || activeTab === "ai-assistant" ? "h-[calc(100vh-64px)] overflow-hidden box-border py-3" : ""}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
