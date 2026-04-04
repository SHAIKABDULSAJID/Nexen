import React, { useState, useRef } from "react";
import { User } from "../types";
import Logo from "./Logo";
import {
  ArrowRight,
  User as UserIcon,
  Sparkles,
  Upload,
  Trash2,
} from "lucide-react";
import { compressImageToDataUrl } from "../utils/image";
import { getAvatarSrc } from "../utils/avatar";

const DEFAULT_AVATAR_PATH = "/default-avatar.svg";

interface SetupProfileViewProps {
  user: User;
  onComplete: (data: Partial<User>) => void;
  token: string;
}

const SetupProfileView: React.FC<SetupProfileViewProps> = ({
  user,
  onComplete,
  token,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    username: user.username,
    bio: "",
    avatar: user.avatar || DEFAULT_AVATAR_PATH,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImageToDataUrl(file);
        setFormData((prev) => ({ ...prev, avatar: compressedDataUrl }));
      } catch (error) {
        console.error("Avatar upload failed:", error);
        alert("Unable to process image. Please try a different file.");
      }
    }

    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: DEFAULT_AVATAR_PATH }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedUser = await response.json();
      onComplete(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[100px] -z-10" />

      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <Logo className="h-10 text-slate-900 dark:text-white" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-[32px] shadow-2xl shadow-blue-200 dark:shadow-blue-900/20 border border-slate-200 dark:border-white/10 p-6 relative animate-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3 h-3" /> Step 2: Personalize
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
            Welcome to the Club!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Let's build your professional identity on Nexen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center mb-4">
            <div
              className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 border-4 border-white dark:border-slate-800 shadow-md cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.avatar ? (
                <img
                  src={getAvatarSrc(formData.avatar)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                  <svg
                    className="w-full h-full text-slate-300 dark:text-white/20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p
              className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Profile Picture
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-300 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagi Kumar"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">
                  @
                </span>
                <input
                  type="text"
                  required
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              Short Bio
            </label>
            <textarea
              placeholder="What are you building? Keep it catchy!"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 group mt-2"
          >
            Create My Profile{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      <p className="mt-6 text-[10px] text-slate-500 font-medium">
        You can always change these details later in Settings.
      </p>
    </div>
  );
};

export default SetupProfileView;
