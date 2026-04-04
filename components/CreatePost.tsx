import React, { useState } from "react";
import { Image, Send, Sparkles, Loader2 } from "lucide-react";
import { refinePostText } from "../services/geminiService";
import { User } from "../types";
import { getAvatarSrc } from "../utils/avatar";

interface CreatePostProps {
  onPost: (content: string, image?: string) => void;
  currentUser: User;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPost, currentUser }) => {
  const [content, setContent] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!content.trim()) return;
    setIsRefining(true);
    const refined = await refinePostText(content);
    if (refined) {
      setContent(refined);
    }
    setIsRefining(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = () => {
    if (!content.trim() && !imageData) return;
    onPost(content, imageData || undefined);
    setContent("");
    setImageData(null);
  };

  return (
    <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/10 p-4 mb-6 shadow-sm transition-colors duration-300">
      <div className="flex gap-3 items-start">
        <img
          src={getAvatarSrc(currentUser.avatar)}
          className="w-10 h-10 rounded-lg shrink-0 object-cover"
          alt="Avatar"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${currentUser.name.split(" ")[0]}?`}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 min-h-[100px] resize-none text-sm py-2"
          />
          {imageData && (
            <div className="mb-3 relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
              <img
                src={imageData}
                alt="Post attachment preview"
                className="w-full max-h-72 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageData(null)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md hover:bg-black/75"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
            <div className="flex gap-2">
              <label className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer">
                <Image className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleRefine}
                disabled={isRefining || !content}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${content ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/30" : "bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500"}`}
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Refine with AI
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() && !imageData}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${content.trim() || imageData ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 dark:shadow-blue-900/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed"}`}
            >
              Post <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
