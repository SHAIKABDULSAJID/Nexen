import React, { useState, useRef } from "react";
import { User } from "../types";
import {
  X,
  Save,
  Camera,
  Trash2,
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { compressImageToDataUrl } from "../utils/image";
import { getAvatarSrc } from "../utils/avatar";

const DEFAULT_AVATAR_PATH = "/default-avatar.svg";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: User) => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  theme,
  toggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "app">("profile");
  const [formData, setFormData] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFormData(user);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Profile save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 w-[90%] md:w-full max-w-lg rounded-[32px] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 border-2 border-slate-200 dark:border-white/20 flex flex-col md:flex-row h-[70vh] md:h-[500px] ring-1 ring-black/5 dark:ring-white/5">
        {/* Sidebar */}
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 md:p-5 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          <h3 className="hidden md:block font-black text-slate-900 dark:text-white text-base mb-4">
            Settings
          </h3>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === "profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"}`}
          >
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("app")}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === "app" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"}`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">App Settings</span>
            <span className="sm:hidden">App</span>
          </button>
          <button className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
            <Shield className="w-4 h-4" />
            Privacy
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white">
              {activeTab === "profile"
                ? "Profile Information"
                : "Application Settings"}
            </h4>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "profile" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img
                      src={getAvatarSrc(formData.avatar || DEFAULT_AVATAR_PATH)}
                      className="w-24 h-24 rounded-[32px] object-cover border-4 border-slate-100 dark:border-slate-800 shadow-sm"
                      alt="Avatar"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-6 h-6" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 -mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    <Camera className="w-3 h-3" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-300 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Bio / Headline
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />{" "}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                      {theme === "dark" ? (
                        <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Dark Mode
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Adjust the appearance of the app
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === "dark" ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    System
                  </h5>
                  <div className="space-y-2">
                    {[
                      "Email Notifications",
                      "Push Notifications",
                      "Desktop Alerts",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer group"
                      >
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item}
                        </span>
                        <div className="w-10 h-5 rounded-full bg-blue-600 relative">
                          <div className="absolute top-1 left-5 w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
