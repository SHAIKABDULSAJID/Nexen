import React from "react";
import { User, Post } from "../types";
import PostCard from "./PostCard";
import {
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Briefcase,
} from "lucide-react";
import { getAvatarSrc } from "../utils/avatar";

interface ProfileViewProps {
  user: User;
  posts: Post[];
  currentUser: User;
  onBack: () => void;
  onDeletePost?: (id: string) => void;
  onEditPost?: (id: string, content: string) => Promise<void> | void;
  savedPostIds?: string[];
  onToggleSave?: (id: string) => void;
  onToggleLike: (postId: string) => Promise<void> | void;
  onAddComment: (postId: string, text: string) => Promise<void> | void;
  onUserClick?: (user: User) => void;
  isFollowing?: boolean;
  onToggleFollow?: (userId: string) => void;
  onMessageUser?: (user: User) => void;
  onOpenSettings?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts,
  currentUser,
  onBack,
  onDeletePost,
  onEditPost,
  savedPostIds = [],
  onToggleSave,
  onToggleLike,
  onAddComment,
  onUserClick,
  isFollowing = false,
  onToggleFollow,
  onMessageUser,
  onOpenSettings,
}) => {
  const userPosts = posts.filter((p) => p.userId === user.id);

  return (
    <div className="md:col-span-12 lg:col-span-6 space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {user.name}
        </h2>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="px-6 pb-6 relative">
          <img
            src={getAvatarSrc(user.avatar)}
            alt={user.name}
            className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 object-cover absolute -top-12 bg-white dark:bg-slate-800"
          />

          <div className="flex justify-end pt-4">
            {currentUser.id === user.id ? (
              <button
                onClick={() => onOpenSettings && onOpenSettings()}
                className="px-6 py-2 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-full text-sm hover:bg-slate-200 dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-white/10"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageUser && onMessageUser(user);
                  }}
                  className="px-5 py-2 bg-white dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-full text-sm hover:bg-slate-100 dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-white/20"
                >
                  Message
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow && onToggleFollow(user.id);
                  }}
                  className={`px-6 py-2 font-bold rounded-full text-sm transition-all active:scale-95 relative z-10 ${
                    isFollowing
                      ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-400 group"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  }`}
                >
                  <span className={isFollowing ? "group-hover:hidden" : ""}>
                    {isFollowing ? "Following" : "Follow"}
                  </span>
                  {isFollowing && (
                    <span className="hidden group-hover:inline">Unfollow</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="mt-14">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              @{user.username}
            </p>
          </div>

          <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
            {user.bio}
          </p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
            {user.role && user.company && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>
                  {user.role} at {user.company}
                </span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>

          <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-900 dark:text-white">
                {user.followingIds?.length || 0}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Following
              </span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="font-bold text-slate-900 dark:text-white">
                {user.followerIds?.length || 0}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Followers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">
          Posts
        </h3>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost}
              isSaved={savedPostIds.includes(post.id)}
              onToggleSave={() => onToggleSave && onToggleSave(post.id)}
              onToggleLike={onToggleLike}
              onAddComment={onAddComment}
              onUserClick={onUserClick}
            />
          ))
        ) : (
          <div className="bg-white dark:bg-white/5 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-sm text-slate-400 font-bold italic">
              No posts yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
