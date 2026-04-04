import React from "react";
import { Community, Post, User } from "../types";
import PostCard from "./PostCard";
import { ChevronLeft, Users, Info, Settings, MoreVertical } from "lucide-react";

interface CommunityViewProps {
  community: Community;
  posts: Post[];
  currentUser: User;
  onBack: () => void;
  savedPostIds?: string[];
  onToggleSave?: (id: string) => void;
  onToggleLike: (postId: string) => Promise<void> | void;
  onAddComment: (postId: string, text: string) => Promise<void> | void;
  onDeletePost?: (id: string) => void;
  onEditPost?: (id: string, content: string) => Promise<void> | void;
  onUserClick?: (user: User) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({
  community,
  posts,
  currentUser,
  onBack,
  savedPostIds = [],
  onToggleSave,
  onToggleLike,
  onAddComment,
  onDeletePost,
  onEditPost,
  onUserClick,
}) => {
  return (
    <div className="md:col-span-12 lg:col-span-6 space-y-4">
      {/* Community Header */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm mb-6 transition-colors duration-300">
        <div className="h-24 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 relative">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur shadow-sm rounded-full hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>
        </div>
        <div className="px-6 pb-6 -mt-8 relative">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-4xl">
                {community.icon}
              </div>
              <div className="mb-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  {community.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {community.members} Members
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              <button className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all">
                Join
              </button>
              <button className="p-2.5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Welcome to the official {community.name} group! This is a dedicated
            space for builders and founders within the ecosystem to share
            insights and collaborate.
          </p>
        </div>

        <div className="flex border-t border-slate-200 dark:border-white/10 px-2 py-1">
          <TabItem label="Feed" active />
          <TabItem label="Events" />
          <TabItem label="Members" />
          <TabItem label="About" />
        </div>
      </div>

      {/* Community Feed */}
      <div className="space-y-4 pb-20 md:pb-0">
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2 mb-2">
          Community Discussions
        </h3>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            isSaved={savedPostIds.includes(post.id)}
            onToggleSave={() => onToggleSave && onToggleSave(post.id)}
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
            onDeletePost={onDeletePost}
            onEditPost={onEditPost}
            onUserClick={onUserClick}
          />
        ))}
        {posts.length === 0 && (
          <div className="bg-slate-50 dark:bg-white/5 p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            <Info className="w-12 h-12 text-slate-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic">
              No discussions yet in this community.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TabItem: React.FC<{ label: string; active?: boolean }> = ({
  label,
  active,
}) => (
  <button
    className={`px-4 py-3 text-xs font-bold transition-all relative ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
    )}
  </button>
);

export default CommunityView;
