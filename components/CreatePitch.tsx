import React, { useState, useEffect, useRef } from "react";
import { X, Rocket, Sparkles, Info, Check, AlertCircle } from "lucide-react";

interface CreatePitchProps {
  isOpen: boolean;
  onClose: () => void;
  onPitch: (title: string, description: string, category: string) => void;
  isInline?: boolean;
}

const CreatePitch: React.FC<CreatePitchProps> = ({
  isOpen,
  onClose,
  onPitch,
  isInline = false,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const categories = [
    "SaaS",
    "AI",
    "Fintech",
    "EdTech",
    "Hardware",
    "Marketplace",
    "DevTools",
    "Web3",
    "Others",
  ];

  const MAX_TITLE_LENGTH = 80;
  const MAX_DESCRIPTION_LENGTH = 300;

  // Auto-scroll to form when opened
  useEffect(() => {
    if (isOpen && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [isOpen]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/pitches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category,
          }),
        });

        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data = isJson
          ? await response.json()
          : {
              error:
                "Backend API is not reachable. Start backend on port 3000.",
            };

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit pitch");
        }

        // Call the onPitch callback
        onPitch(title, description, category);

        // Reset form
        setTitle("");
        setDescription("");
        setCategory("SaaS");
        setShowSuccess(true);
      } catch (error) {
        console.error("Error submitting pitch:", error);
        alert(
          `Error: ${error instanceof Error ? error.message : "Failed to submit pitch"}`,
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const titleProgress = (title.length / MAX_TITLE_LENGTH) * 100;
  const descriptionProgress =
    (description.length / MAX_DESCRIPTION_LENGTH) * 100;
  const isTitleValid = title.trim().length > 0;
  const isDescriptionValid = description.trim().length > 0;
  const isFormValid = isTitleValid && isDescriptionValid;

  if (!isOpen) return null;

  return (
    <div
      className={
        isInline
          ? "w-full"
          : "fixed inset-0 z-50 flex items-center justify-center p-4"
      }
    >
      {!isInline && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
      )}

      <div
        ref={formRef}
        className={`relative w-full max-w-2xl h-[90vh] bg-[#0f172a] rounded-[32px] shadow-2xl border border-slate-800 flex flex-col ${
          isInline ? "mx-auto" : ""
        }`}
      >
        {/* Success Message */}
        {showSuccess && (
          <div className="sticky top-0 z-10 bg-green-500/20 border-b border-green-500/30 p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-sm font-bold text-green-200">
              🎉 Your idea has been launched to the community!
            </p>
          </div>
        )}

        <div className="flex-shrink-0 p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Pitch Your Idea
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Launch your next big thing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Title Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Startup Name / Title
                </label>
                <span
                  className={`text-[10px] font-bold ${isTitleValid ? "text-green-400" : "text-slate-500"}`}
                >
                  {title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
                }
                placeholder="e.g. EcoStream, NeuroScribe, PayFlow..."
                maxLength={MAX_TITLE_LENGTH}
                className={`w-full bg-slate-900 border-2 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-600 transition-all outline-none ${
                  isTitleValid
                    ? "border-green-500/50 focus:border-green-500"
                    : "border-slate-800 focus:border-blue-600"
                }`}
                required
              />
              {isTitleValid && (
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-bold">
                    Title is good
                  </span>
                </div>
              )}
            </div>

            {/* Category Field */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                      category === cat
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-900 text-slate-500 border border-slate-800 hover:bg-slate-800 disabled:opacity-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  The Pitch (Elevator Statement)
                </label>
                <span
                  className={`text-[10px] font-bold ${isDescriptionValid ? "text-green-400" : "text-slate-500"}`}
                >
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value.slice(0, MAX_DESCRIPTION_LENGTH),
                  )
                }
                placeholder="Describe your idea in 1-2 sentences. What problem are you solving?"
                maxLength={MAX_DESCRIPTION_LENGTH}
                className={`w-full bg-slate-900 border-2 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-600 transition-all outline-none min-h-[140px] resize-none ${
                  isDescriptionValid
                    ? "border-green-500/50 focus:border-green-500"
                    : "border-slate-800 focus:border-blue-600"
                }`}
                required
              />
              {/* Character Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isDescriptionValid ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(descriptionProgress, 100)}%` }}
                />
              </div>
              {isDescriptionValid && (
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-bold">
                    Description is good
                  </span>
                </div>
              )}
            </div>

            {/* Info Banner */}
            <div className="bg-blue-600/10 p-5 rounded-2xl flex gap-4 border border-blue-500/20">
              <Info className="w-6 h-6 text-blue-400 shrink-0 flex-shrink-0" />
              <p className="text-xs text-blue-200 font-medium leading-relaxed">
                Pitches are public. The community will vote on your idea. Top
                voted ideas get featured on the trending list and receive
                exclusive networking opportunities.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full text-white py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl ${
                isFormValid && !isSubmitting
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer"
                  : "bg-slate-700 opacity-50 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Launch to Community
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePitch;
