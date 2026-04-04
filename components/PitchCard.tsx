import React, { useState } from "react";
import { Pitch, User } from "../types";
import {
  ArrowBigUp,
  TrendingUp,
  Users,
  MessageSquare,
  Share2,
  Send,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAvatarSrc } from "../utils/avatar";

interface PitchCardProps {
  pitch: Pitch;
  onVote: (id: string) => void;
  onAddComment: (pitchId: string, text: string) => void;
  currentUser: User;
  onUserClick?: (user: User) => void;
}

const PitchCard: React.FC<PitchCardProps> = ({
  pitch,
  onVote,
  onAddComment,
  currentUser,
  onUserClick,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const hasVoted = pitch.votedBy.includes(currentUser.id);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(pitch.id, newComment);
    setNewComment("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a] dark:bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all group p-4"
    >
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onVote(pitch.id)}
            className={`w-12 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
              hasVoted
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
            }`}
          >
            <ArrowBigUp
              className={`w-6 h-6 ${hasVoted ? "fill-current" : ""}`}
            />
            <span className="text-sm font-black">{pitch.votes}</span>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUserClick?.(pitch.user)}
                className="relative"
              >
                <img
                  src={getAvatarSrc(pitch.user.avatar)}
                  alt={pitch.user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800"
                  referrerPolicy="no-referrer"
                />
              </button>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white leading-tight">
                    {pitch.user.name}
                  </h3>
                  {pitch.isTrending && (
                    <span className="flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full border border-blue-400/20">
                      <TrendingUp className="w-2 h-2" /> Trending
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">
                  {pitch.timestamp}
                </p>
              </div>
            </div>

            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
              {pitch.category}
            </span>
          </div>

          <h2 className="text-base font-black text-white leading-tight mb-2">
            {pitch.title}
          </h2>

          <div className="bg-[#1e293b] rounded-lg p-3 mb-3">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
              PROBLEM SOLVED
            </p>
            <p className="text-[10px] text-slate-200 leading-relaxed">
              {pitch.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[10px] font-black text-slate-300">
                {pitch.supportersCount || 0}
              </span>
              <span className="text-[10px] font-medium">
                community supporters
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/30 text-blue-400 text-[8px] font-black hover:bg-blue-500/10 transition-all">
                <Lock className="w-2 h-2" /> Investor Pitch Deck
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`p-1 rounded-full transition-colors ${showComments ? "text-blue-400 bg-blue-400/10" : "text-slate-400 hover:text-blue-400"}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6 pt-6 border-t border-slate-800"
          >
            <div className="space-y-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <img
                  src={getAvatarSrc(currentUser.avatar)}
                  className="w-8 h-8 rounded-full object-cover"
                  alt=""
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a suggestion or question..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:scale-110 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Comment List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {pitch.commentList.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={getAvatarSrc(comment.user.avatar)}
                      className="w-7 h-7 rounded-full object-cover"
                      alt=""
                    />
                    <div className="flex-1 bg-slate-800 p-3 rounded-2xl border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-white">
                          {comment.user.name}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
                {pitch.commentList.length === 0 && (
                  <p className="text-center text-[10px] text-slate-400 py-4">
                    No comments yet. Be the first to give feedback!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PitchCard;
