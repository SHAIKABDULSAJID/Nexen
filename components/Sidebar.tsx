import React from "react";
import { User, Community } from "../types";
import { COMMUNITIES } from "../constants";
import {
  Home,
  MessageSquare,
  Bookmark,
  UserPlus,
  Settings,
  Hash,
  Sparkles,
  LogOut,
  Rocket,
} from "lucide-react";
import { getAvatarSrc } from "../utils/avatar";

interface SidebarProps {
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
  currentUser: User;
  onOpenNetwork: () => void;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
  onSelectCommunity: (community: Community) => void;
  onDiscoverMore: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenNetwork,
  onOpenPremium,
  onOpenSettings,
  onSelectCommunity,
  onDiscoverMore,
  onLogout,
}) => {
  return (
    <div className="hidden lg:block lg:col-span-3 lg:h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-1 space-y-6 pb-10">
      {/* Navigation List */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-2 shadow-sm space-y-1 transition-colors duration-300">
        <NavigationItem
          icon={<Home className="w-[18px] h-[18px]" />}
          label="Home"
          active={activeTab === "home"}
          onClick={() => onTabChange("home")}
        />
        <NavigationItem
          icon={<Rocket className="w-[18px] h-[18px]" />}
          label="Launchpad"
          active={activeTab === "launchpad"}
          onClick={() => onTabChange("launchpad")}
        />
        <NavigationItem
          icon={<MessageSquare className="w-[18px] h-[18px]" />}
          label="Messages"
          active={activeTab === "chats"}
          onClick={() => onTabChange("chats")}
        />
        <NavigationItem
          icon={<Bookmark className="w-[18px] h-[18px]" />}
          label="Saved Post"
          active={activeTab === "saved"}
          onClick={() => onTabChange("saved")}
        />
        <NavigationItem
          icon={<Sparkles className="w-[18px] h-[18px]" />}
          label="AI Assistant"
          active={activeTab === "ai-assistant"}
          onClick={() => onTabChange("ai-assistant")}
        />
      </div>

      {/* Profile Details */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-2 shadow-sm transition-colors duration-300">
        <div
          onClick={() => onTabChange("profile" as any)}
          className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-colors duration-300 cursor-pointer hover:border-blue-500/30 group/profile"
        >
          <div className="h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-600 opacity-80" />
          <div className="px-4 pb-4 -mt-8">
            <div className="relative inline-block mb-3">
              <img
                src={getAvatarSrc(currentUser.avatar)}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl border-4 border-white dark:border-white/10 object-cover shadow-sm group-hover/profile:scale-105 transition-transform"
              />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white leading-none group-hover/profile:text-blue-600 dark:group-hover/profile:text-blue-400 transition-colors">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-blue-200 mt-1 mb-2">
              @{currentUser.username}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-tight mb-4">
              {currentUser.bio}
            </p>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200 dark:border-white/10">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser.followerIds.length}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  Followers
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser.followingIds.length}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  Following
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-1">
              <button onClick={onOpenNetwork} className="w-full text-left">
                <SidebarLink
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                  label="Network requests"
                  count={3}
                />
              </button>
              <button onClick={onOpenPremium} className="w-full text-left">
                <SidebarLink
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                  label="NEXEN Premium"
                  isPro
                />
              </button>
              <button onClick={onOpenSettings} className="w-full text-left">
                <SidebarLink
                  icon={<Settings className="w-3.5 h-3.5" />}
                  label="Profile Settings"
                />
              </button>
              <button
                onClick={onLogout}
                className="w-full text-left mt-2 border-t border-slate-200 dark:border-white/10 pt-2"
              >
                <SidebarLink
                  icon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
                  label="Logout"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Communities */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Communities
          </h3>
          <Hash className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="space-y-4">
          {COMMUNITIES.map((community) => (
            <div
              key={community.id}
              onClick={() => onSelectCommunity(community)}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 transition-colors">
                  {community.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {community.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {community.members} members
                  </p>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={onDiscoverMore}
            className="w-full py-2.5 text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors mt-2"
          >
            Discover more
          </button>
        </div>
      </div>
    </div>
  );
};

const NavigationItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
      active
        ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
    }`}
  >
    <div
      className={`${active ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
    >
      {icon}
    </div>
    <span className="text-xs font-bold">{label}</span>
  </button>
);

const SidebarLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  count?: number;
  isPro?: boolean;
}> = ({ icon, label, count, isPro }) => (
  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors group py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
    <div className="flex items-center gap-3">
      <div
        className={`${isPro ? "text-amber-500 dark:text-amber-400" : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-bold">{label}</span>
    </div>
    {count && (
      <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    )}
    {isPro && (
      <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
        Pro
      </span>
    )}
  </div>
);

export default Sidebar;
