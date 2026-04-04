import React, { useState } from "react";
import Logo from "./Logo";
import {
  Rocket,
  ShieldCheck,
  Users,
  Globe,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle2,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";

interface LoginViewProps {
  onLogin: (user: any, token: string, isNewUser?: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<
    "hero" | "messages" | "communities" | "about"
  >("hero");

  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return {
      error:
        text ||
        "Unexpected server response. Please ensure the backend is running.",
    };
  };

  const parseResponseWithTimeout = async (response: Response) => {
    return Promise.race([
      parseResponse(response),
      new Promise<{ error: string }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              error:
                "Server took too long to finish response. Please try again.",
            }),
          5000,
        ),
      ),
    ]);
  };

  const fetchWithTimeout = async (
    input: RequestInfo | URL,
    init: RequestInit,
    timeoutMs = 15000,
  ) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  const buildEndpointCandidates = (path: string) => {
    const origin = window.location.origin;

    // Always try same-origin first to avoid CORS/mixed-content issues.
    const candidates = [`${origin}${path}`];

    // Only use explicit http fallbacks when the page itself is served over http.
    if (window.location.protocol === "http:") {
      candidates.push(
        `http://localhost:3002${path}`,
        `http://127.0.0.1:3002${path}`,
        `http://localhost:3000${path}`,
        `http://127.0.0.1:3000${path}`,
      );
    }

    return [...new Set(candidates)];
  };

  const postAuthWithFallback = async (path: string, body: unknown) => {
    const endpoints = buildEndpointCandidates(path);
    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        return await fetchWithTimeout(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
          12000,
        );
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error("Network request failed");
      }
    }

    throw (
      lastError ||
      new Error(
        "Cannot reach backend server. Open app via http://localhost:3002 and ensure npm run dev is running.",
      )
    );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const body = isSignUp ? { name, email, password } : { email, password };

      const response = await postAuthWithFallback(endpoint, body);

      const data = await parseResponseWithTimeout(response);

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Call onLogin with user data and token
      onLogin(data.user, data.token, Boolean(data.isNewUser));
    } catch (error) {
      console.error("Auth error:", error);
      const rawMessage =
        error instanceof Error ? error.message : "Authentication failed";

      setError(
        error instanceof Error && error.name === "AbortError"
          ? "Login request timed out. Please try again."
          : rawMessage === "Failed to fetch"
            ? "Cannot connect to backend. Start server with npm run dev and open http://localhost:3002."
            : error instanceof Error
              ? error.message
              : "Authentication failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // For demo purposes, simulate Google OAuth
      // In a real app, you'd integrate with Google OAuth
      const mockGoogleUser = {
        name: "Demo User",
        email: "demo@google.com",
        googleId: "google_" + Date.now(),
      };

      const response = await postAuthWithFallback(
        "/api/auth/google",
        mockGoogleUser,
      );

      const data = await parseResponseWithTimeout(response);

      if (!response.ok) {
        throw new Error(data.error || "Google authentication failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Call onLogin with user data and token
      onLogin(data.user, data.token, Boolean(data.isNewUser));
    } catch (error) {
      console.error("Google auth error:", error);
      const rawMessage =
        error instanceof Error ? error.message : "Google authentication failed";

      setError(
        error instanceof Error && error.name === "AbortError"
          ? "Google login request timed out. Please try again."
          : rawMessage === "Failed to fetch"
            ? "Cannot connect to backend. Start server with npm run dev and open http://localhost:3002."
            : error instanceof Error
              ? error.message
              : "Google authentication failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch (view) {
      case "messages":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto text-center py-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
              Direct Messages 💬
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              Connect directly with founders, investors, and engineers. Build
              your network one conversation at a time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl mb-4 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                    Founder {i}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hey, I saw your recent post about scaling. Would love to
                    chat!
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("hero")}
              className="mt-10 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center gap-2 mx-auto hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </button>
          </div>
        );
      case "communities":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto text-center py-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
              Active Communities 🌐
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              Join 500+ micro-networks focused on specialized tech stacks and
              domains.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React Native India",
                "SaaS Builders",
                "AI/ML Enthusiasts",
                "Web3 Devs",
                "Designers Hub",
              ].map((c) => (
                <div
                  key={c}
                  className="px-6 py-3 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm font-bold text-slate-900 dark:text-white text-sm"
                >
                  {c}
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("hero")}
              className="mt-10 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center gap-2 mx-auto hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </button>
          </div>
        );
      case "about":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto text-center py-12">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
              About Nexen
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">
              Nexen was built with one goal: to remove the friction between
              having a great idea and finding the people to help build it. We
              are a professional network for founders, by founders.
            </p>
            <button
              onClick={() => setView("hero")}
              className="mt-10 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center gap-2 mx-auto hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </button>
          </div>
        );
      default:
        return (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 py-6">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
                Where{" "}
                <span className="text-blue-600 dark:text-blue-500">
                  Founders
                </span>{" "}
                <br />
                Connect & Grow.
              </h1>

              <div className="max-w-sm mx-auto lg:mx-0 bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-xl mb-6">
                <form onSubmit={handleAuth} className="space-y-3">
                  {isSignUp && (
                    <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Work email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {error && (
                    <div className="text-red-500 text-xs font-medium text-center bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-200 dark:border-red-500/20">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 group disabled:opacity-70"
                  >
                    {isLoading ? (
                      "Verifying..."
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign in with Email"}{" "}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[10px] font-black text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    {isSignUp
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Sign Up"}
                  </button>
                </div>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    or
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-70"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    className="w-4 h-4"
                    alt="Google"
                  />
                  Sign in with Google
                </button>
              </div>
            </div>

            {/* Visual Card */}
            <div className="hidden lg:block flex-1 relative scale-90">
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[32px] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative">
                <div className="absolute -top-4 -right-4 bg-blue-600 p-4 rounded-[24px] text-white shadow-xl animate-bounce">
                  <Rocket className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Verified Badge
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Founder Identity Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center overflow-x-hidden relative transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10" />
      <header className="w-full max-w-6xl px-6 py-4 flex justify-between items-center z-10">
        <div className="cursor-pointer" onClick={() => setView("hero")}>
          <Logo className="h-8 md:h-10 text-slate-900 dark:text-white" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setView("messages")}
            className={`text-xs font-bold transition-colors ${view === "messages" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
          >
            Messages
          </button>
          <button
            onClick={() => setView("communities")}
            className={`text-xs font-bold transition-colors ${view === "communities" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
          >
            Communities
          </button>
          <button
            onClick={() => setView("about")}
            className={`text-xs font-bold transition-colors ${view === "about" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
          >
            About
          </button>
        </div>
        <button
          onClick={() => setView("hero")}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          Get Started
        </button>
      </header>
      <main className="flex-1 w-full max-w-6xl px-6 flex flex-col items-center justify-center relative z-10">
        {renderSection()}
      </main>
    </div>
  );
};

export default LoginView;
