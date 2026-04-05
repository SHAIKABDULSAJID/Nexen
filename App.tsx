import React, { useCallback, useEffect, useState } from "react";
import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import RightPanel from "./components/RightPanel";
import PostCard from "./components/PostCard";
import CreatePost from "./components/CreatePost";
import MessagingView from "./components/MessagingView";
import PitchCard from "./components/PitchCard";
import CreatePitch from "./components/CreatePitch";
import NetworkRequestsModal from "./components/NetworkRequestsModal";
import PremiumModal from "./components/PremiumModal";
import SettingsModal from "./components/SettingsModal";
import CommunityView from "./components/CommunityView";
import DiscoverCommunitiesView from "./components/DiscoverCommunitiesView";
import LoginView from "./components/LoginView";
import SetupProfileView from "./components/SetupProfileView";
import AiAssistantView from "./components/AiAssistantView";
import ProfileView from "./components/ProfileView";
import { CURRENT_USER, INITIAL_PITCHES } from "./constants";
import { Post, User, Community, Pitch } from "./types";
import { Rocket, Sparkles, TrendingUp, ChevronLeft } from "lucide-react";

const DEFAULT_AVATAR_PATH = "/default-avatar.svg";

const formatTimestamp = (value?: string) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  // Within a minute
  if (diffSecs < 60) return "Just now";

  // Within an hour - show minutes ago
  if (diffMins < 60) {
    return diffMins === 1 ? "1 min ago" : `${diffMins} mins ago`;
  }

  // Within a day - show hours ago
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  // Within 6 days - show days ago
  if (diffDays <= 6) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }

  // Older than 6 days but within a year - show months/weeks
  if (diffMonths > 0) {
    return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
  }

  // Fallback to date format
  return date.toLocaleDateString();
};

const normalizeUserFromApi = (userData: any): User => {
  const id = String(userData?.id || userData?._id || `user-${Date.now()}`);
  const email = String(userData?.email || "");
  const fallbackName = email.includes("@") ? email.split("@")[0] : "User";
  const name = String(userData?.name || fallbackName || "User");
  const username = String(
    userData?.username || fallbackName || `user_${id.slice(0, 6)}`,
  );

  return {
    id,
    name,
    username,
    email,
    avatar: userData?.avatar || DEFAULT_AVATAR_PATH,
    bio: String(userData?.bio || ""),
    role: String(userData?.role || ""),
    company: String(userData?.company || ""),
    location: String(userData?.location || ""),
    website: String(userData?.website || ""),
    phone: String(userData?.phone || ""),
    followingIds: Array.isArray(userData?.followingIds)
      ? userData.followingIds
      : [],
    followerIds: Array.isArray(userData?.followerIds)
      ? userData.followerIds
      : [],
  };
};

const App: React.FC = () => {
  useEffect(() => {
    console.log("🧠 App mounted");
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "chats"
    | "community"
    | "discover"
    | "saved"
    | "ai-assistant"
    | "profile"
    | "launchpad"
  >("home");
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    null,
  );
  const [activeProfileUser, setActiveProfileUser] = useState<User | null>(null);
  const [chatPrefillUser, setChatPrefillUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>(INITIAL_PITCHES);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [localFollowingMap, setLocalFollowingMap] = useState<
    Record<string, boolean>
  >({});

  // Check for existing authentication on app load
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token and get user data
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            localStorage.removeItem("token");
            throw new Error("Invalid token");
          }
        })
        .then((userData) => {
          setCurrentUser(normalizeUserFromApi(userData));
          setAuthToken(token);
          setIsAuthenticated(true);
          setIsSetupComplete(true); // Assume setup is complete for existing users
        })
        .catch((error) => {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const refreshFeed = useCallback(() => {
    if (!isAuthenticated || !authToken || !isSetupComplete) {
      return Promise.resolve();
    }

    return fetch("/api/posts", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch posts");
      })
      .then((fetchedPosts) => {
        const postsWithUserData = fetchedPosts.map(normalizePostFromApi);
        setPosts(postsWithUserData);
      })
      .catch((error) => {
        console.error("Failed to fetch posts:", error);
      });
  }, [isAuthenticated, authToken, isSetupComplete]);

  // Fetch all posts when authenticated
  React.useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  // Fetch all pitches from database
  React.useEffect(() => {
    fetch("/api/pitches")
      .then((response) => {
        if (!response.ok) {
          console.warn(`API returned status ${response.status}`);
          // Start with initial pitches if API fails
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.pitches && Array.isArray(data.pitches)) {
          const normalizedPitches = data.pitches.map((pitch: any) => ({
            id: pitch._id,
            userId: pitch.userId,
            user: {
              id: pitch.userId,
              name: pitch.userName || "Anonymous",
              username: pitch.userId,
              avatar: pitch.userAvatar || "/default-avatar.svg",
            },
            title: pitch.title,
            description: pitch.description,
            votes: pitch.upvotes || 0,
            comments: pitch.comments || 0,
            commentList: [],
            category: pitch.category,
            timestamp: pitch.createdAt
              ? new Date(pitch.createdAt).toLocaleDateString()
              : "Just now",
            votedBy: pitch.upvotedByIds || [],
            supportersCount: (pitch.upvotedByIds || []).length,
            isTrending: false,
          }));
          setPitches(normalizedPitches);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch pitches - using initial data:", error);
        // Keep using initial pitches on error
      });
  }, []);

  // Modal States
  const [pitchSort, setPitchSort] = useState<"top" | "newest" | "random">(
    "top",
  );
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Disable browser scroll restoration
  React.useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Force scroll to top instantly when view-changing states update
  React.useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    resetScroll();
    // Secondary backup for dynamic content loading
    const timer = setTimeout(resetScroll, 0);
    const timerLong = setTimeout(resetScroll, 100); // Extra safety for slower renders

    return () => {
      clearTimeout(timer);
      clearTimeout(timerLong);
    };
  }, [
    activeTab,
    activeProfileUser,
    activeCommunity,
    isAuthenticated,
    isSetupComplete,
  ]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const followingMap = {
    ...(currentUser.followingIds || []).reduce(
      (map, userId) => {
        map[userId] = true;
        return map;
      },
      {} as Record<string, boolean>,
    ),
    ...localFollowingMap,
  };

  const updateUsersInLocalContent = (updatedUsers: User[]) => {
    const userMap = new Map(updatedUsers.map((u) => [u.id, u]));

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const updatedPostUser = userMap.get(post.userId);
        return updatedPostUser ? { ...post, user: updatedPostUser } : post;
      }),
    );

    setPitches((prevPitches) =>
      prevPitches.map((pitch) => ({
        ...pitch,
        user: userMap.get(pitch.userId) || pitch.user,
        commentList: pitch.commentList.map((comment) => ({
          ...comment,
          user: userMap.get(comment.userId) || comment.user,
        })),
      })),
    );
  };

  function normalizePostFromApi(post: any): Post {
    const fallbackPostUser = post.user || currentUser;

    return {
      id: post.id,
      userId: post.userId,
      user: fallbackPostUser,
      content: post.content,
      image: post.image,
      likes: post.likes || 0,
      comments: post.comments || 0,
      likedByUsers: post.likedByUsers || [],
      commentList: (post.commentList || [])
        .filter((c: any) => !!c && !!c.text)
        .map((c: any) => ({
          id: c.id,
          userId: c.userId,
          user: c.user || fallbackPostUser,
          text: c.text,
          timestamp: formatTimestamp(c.timestamp),
        })),
      reposts: post.reposts || 0,
      reposterList: [],
      timestamp: formatTimestamp(post.createdAt),
      tags: post.tags || [],
    };
  }

  const handleToggleFollow = async (userId: string) => {
    if (!authToken) {
      alert("Session expired. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 404) {
        // Fallback for static mock users that are not yet persisted in DB.
        setLocalFollowingMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update follow status");
      }

      const data = await response.json();
      const updatedCurrentUser = data.currentUser as User;
      const updatedTargetUser = data.targetUser as User;

      setCurrentUser(updatedCurrentUser);

      if (activeProfileUser?.id === updatedTargetUser.id) {
        setActiveProfileUser(updatedTargetUser);
      }

      updateUsersInLocalContent([updatedCurrentUser, updatedTargetUser]);
    } catch (error) {
      console.error("Follow toggle failed:", error);
      alert(error instanceof Error ? error.message : "Follow update failed");
    }
  };

  React.useEffect(() => {
    if (activeTab !== "profile" || !activeProfileUser || !authToken) return;

    let cancelled = false;

    const refreshProfile = async () => {
      try {
        const response = await fetch(`/api/users/${activeProfileUser.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) return;

        const latestUser = (await response.json()) as User;
        if (cancelled) return;

        setActiveProfileUser(latestUser);
        if (latestUser.id === currentUser.id) {
          setCurrentUser(latestUser);
        }
        updateUsersInLocalContent([latestUser]);
      } catch (error) {
        console.error("Profile refresh failed:", error);
      }
    };

    refreshProfile();

    return () => {
      cancelled = true;
    };
  }, [activeTab, activeProfileUser?.id, authToken]);

  const handleToggleSave = (postId: string) => {
    setSavedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  const handlePost = async (content: string, image?: string) => {
    try {
      const tags = content.match(/#\w+/g)?.map((t) => t.slice(1)) || [];

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content,
          image,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const createdPost = await response.json();

      const newPost: Post = normalizePostFromApi(createdPost);
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!authToken) {
      alert("Session expired. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update like");
      }

      const updatedPost = normalizePostFromApi(responseData);
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  };

  const handleAddPostComment = async (postId: string, text: string) => {
    if (!authToken) {
      alert("Session expired. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add comment");
      }

      const updatedPost = normalizePostFromApi(responseData);
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const handleEditComment = async (
    postId: string,
    commentId: string,
    text: string,
  ) => {
    if (!authToken) {
      alert("Session expired. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to edit comment");
      }

      const updatedPost = normalizePostFromApi(responseData);
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    } catch (error) {
      console.error("Error editing comment:", error);
      throw error;
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!authToken) {
      alert("Session expired. Please sign in again.");
      return;
    }

    if (!confirm("Delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete comment");
      }

      const updatedPost = normalizePostFromApi(responseData);
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  const handleReplyComment = async (
    postId: string,
    commentId: string,
    text: string,
  ) => {
    if (!authToken) {
      alert("Session expired. Please sign in again.");
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add reply");
      }

      const updatedPost = normalizePostFromApi(responseData);
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  const handleRemovePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEditPost = async (postId: string, content: string) => {
    try {
      const existingPost = posts.find((p) => p.id === postId);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content,
          image: existingPost?.image,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to edit post");
      }

      const updatedPost = normalizePostFromApi(responseData);
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    } catch (error) {
      console.error("Error editing post:", error);
      throw error;
    }
  };

  const handleNewPitch = (
    title: string,
    description: string,
    category: string,
  ) => {
    // Fetch updated pitches from database
    fetch("/api/pitches")
      .then((response) => {
        if (!response.ok) {
          console.warn(`API returned status ${response.status}`);
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.pitches && Array.isArray(data.pitches)) {
          const normalizedPitches = data.pitches.map((pitch: any) => ({
            id: pitch._id,
            userId: pitch.userId,
            user: {
              id: pitch.userId,
              name: pitch.userName || "Anonymous",
              username: pitch.userId,
              avatar: pitch.userAvatar || "/default-avatar.svg",
            },
            title: pitch.title,
            description: pitch.description,
            votes: pitch.upvotes || 0,
            comments: pitch.comments || 0,
            commentList: [],
            category: pitch.category,
            timestamp: pitch.createdAt
              ? new Date(pitch.createdAt).toLocaleDateString()
              : "Just now",
            votedBy: pitch.upvotedByIds || [],
            supportersCount: (pitch.upvotedByIds || []).length,
            isTrending: false,
          }));
          setPitches(normalizedPitches);
        }
      })
      .catch((error) => {
        console.error(
          "Failed to fetch pitches - keeping current state:",
          error,
        );
      });
  };

  const handleVote = (id: string) => {
    setPitches((prevPitches) => {
      return prevPitches.map((pitch) => {
        if (pitch.id === id) {
          const hasVoted = pitch.votedBy.includes(currentUser.id);
          if (hasVoted) {
            return {
              ...pitch,
              votes: pitch.votes - 1,
              votedBy: pitch.votedBy.filter((uid) => uid !== currentUser.id),
            };
          } else {
            return {
              ...pitch,
              votes: pitch.votes + 1,
              votedBy: [...pitch.votedBy, currentUser.id],
            };
          }
        }
        return pitch;
      });
    });
  };

  const handlePitchComment = (pitchId: string, text: string) => {
    setPitches((prevPitches) => {
      return prevPitches.map((pitch) => {
        if (pitch.id === pitchId) {
          const newComment = {
            id: `pc-${Date.now()}`,
            userId: currentUser.id,
            user: currentUser,
            text,
            timestamp: "Just now",
          };
          return {
            ...pitch,
            comments: pitch.comments + 1,
            commentList: [newComment, ...pitch.commentList],
          };
        }
        return pitch;
      });
    });
  };

  const handleCommunitySelect = (community: Community) => {
    setActiveCommunity(community);
    setActiveTab("community");
  };

  const handleLogin = (userData: any, token: string, isNewUser = false) => {
    // Set authenticated user data
    setCurrentUser(normalizeUserFromApi(userData));
    setAuthToken(token);
    setIsAuthenticated(true);

    // Existing users should enter directly; only new users go through setup.
    setIsSetupComplete(!isNewUser);

    window.scrollTo(0, 0);
  };

  const handleOnboardingComplete = (userData: Partial<User>) => {
    const updatedUser = {
      ...currentUser,
      ...userData,
      avatar: userData.avatar || DEFAULT_AVATAR_PATH,
    };

    setCurrentUser(updatedUser);

    // Keep local timelines in sync so updated avatar/name appear immediately.
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.userId === updatedUser.id ? { ...post, user: updatedUser } : post,
      ),
    );

    setPitches((prevPitches) =>
      prevPitches.map((pitch) => ({
        ...pitch,
        user: pitch.userId === updatedUser.id ? updatedUser : pitch.user,
        commentList: pitch.commentList.map((comment) =>
          comment.userId === updatedUser.id
            ? { ...comment, user: updatedUser }
            : comment,
        ),
      })),
    );

    if (activeProfileUser?.id === updatedUser.id) {
      setActiveProfileUser(updatedUser);
    }

    setIsSetupComplete(true);
    setActiveTab("home");
    window.scrollTo(0, 0);
  };

  const handleSettingsSave = async (updatedUser: User) => {
    if (!authToken) {
      throw new Error("Session expired. Please sign in again.");
    }

    const response = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        company: updatedUser.company,
        location: updatedUser.location,
        website: updatedUser.website,
        phone: updatedUser.phone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save profile");
    }

    const savedUser = normalizeUserFromApi(await response.json());
    setCurrentUser(savedUser);

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.userId === savedUser.id ? { ...post, user: savedUser } : post,
      ),
    );

    setPitches((prevPitches) =>
      prevPitches.map((pitch) => ({
        ...pitch,
        user: pitch.userId === savedUser.id ? savedUser : pitch.user,
        commentList: pitch.commentList.map((comment) =>
          comment.userId === savedUser.id
            ? { ...comment, user: savedUser }
            : comment,
        ),
      })),
    );

    if (activeProfileUser?.id === savedUser.id) {
      setActiveProfileUser(savedUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsSetupComplete(false);
    setActiveCommunity(null);
  };

  // Expose comment handlers globally for PostCard component access.
  // This hook must run before any early return to keep hook order stable.
  React.useEffect(() => {
    (window as any).appHandlers = {
      handleEditComment,
      handleDeleteComment,
      handleReplyComment,
    };
  }, [handleEditComment, handleDeleteComment, handleReplyComment]);

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (!isSetupComplete) {
    return (
      <SetupProfileView
        onComplete={handleOnboardingComplete}
        user={currentUser}
        token={authToken!}
      />
    );
  }

  const handleUserClick = async (user: User) => {
    setChatPrefillUser(null);
    setActiveProfileUser(user);
    setActiveTab("profile");

    if (!authToken) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile details");
      }

      const fullUser = await response.json();
      setActiveProfileUser(fullUser);
      updateUsersInLocalContent([fullUser]);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="md:col-span-12 lg:col-span-6 space-y-4 lg:h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-1">
            <CreatePost onPost={handlePost} currentUser={currentUser} />
            <div className="space-y-4 pb-20 md:pb-0">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onDeletePost={handleRemovePost}
                  onEditPost={handleEditPost}
                  isSaved={savedPostIds.includes(post.id)}
                  onToggleSave={() => handleToggleSave(post.id)}
                  onToggleLike={handleToggleLike}
                  onAddComment={handleAddPostComment}
                  onUserClick={handleUserClick}
                />
              ))}
            </div>
          </div>
        );
      case "community":
        return activeCommunity ? (
          <CommunityView
            community={activeCommunity}
            posts={posts.filter(
              (p) =>
                p.tags.some((t) =>
                  activeCommunity.name.toLowerCase().includes(t.toLowerCase()),
                ) || Math.random() > 0.5,
            )}
            currentUser={currentUser}
            onBack={() => setActiveTab("home")}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddPostComment}
            onDeletePost={handleRemovePost}
            onEditPost={handleEditPost}
            onUserClick={handleUserClick}
          />
        ) : null;
      case "discover":
        return (
          <DiscoverCommunitiesView
            onBack={() => setActiveTab("home")}
            onSelectCommunity={handleCommunitySelect}
          />
        );
      case "chats":
        return (
          <MessagingView
            onBack={() => {
              setChatPrefillUser(null);
              setActiveTab("home");
            }}
            currentUser={currentUser}
            authToken={authToken}
            prefillUser={chatPrefillUser}
            onPrefillHandled={() => setChatPrefillUser(null)}
          />
        );
      case "saved":
        return (
          <div className="md:col-span-12 lg:col-span-6 space-y-4 lg:h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              Saved Posts
            </h1>
            <div className="space-y-4 pb-20 md:pb-0">
              {posts.filter((p) => savedPostIds.includes(p.id)).length > 0 ? (
                posts
                  .filter((p) => savedPostIds.includes(p.id))
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onDeletePost={handleRemovePost}
                      onEditPost={handleEditPost}
                      isSaved={true}
                      onToggleSave={() => handleToggleSave(post.id)}
                      onToggleLike={handleToggleLike}
                      onAddComment={handleAddPostComment}
                      onUserClick={handleUserClick}
                    />
                  ))
              ) : (
                <div className="bg-white dark:bg-white/5 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-sm text-slate-400 font-bold italic">
                    No saved posts yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case "ai-assistant":
        return (
          <AiAssistantView
            savedPosts={posts.filter((p) => savedPostIds.includes(p.id))}
            onBack={() => setActiveTab("home")}
          />
        );
      case "launchpad": {
        const sortedPitches = [...pitches].sort((a, b) => {
          if (pitchSort === "top") return b.votes - a.votes;
          if (pitchSort === "newest")
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          return Math.random() - 0.5;
        });

        return (
          <div className="md:col-span-12 lg:col-span-6 space-y-6 lg:h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-1">
            <div className="flex items-start justify-between px-1">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  The Launchpad
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Discover and support the next big ideas
                </p>
              </div>
              <button
                onClick={() => setIsPitchModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
              >
                <Sparkles className="w-4 h-4" /> Submit Idea
              </button>
            </div>

            <div className="flex gap-4 px-1">
              <button
                onClick={() => setPitchSort("top")}
                className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                  pitchSort === "top"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Top Voted
              </button>
              <button
                onClick={() => setPitchSort("newest")}
                className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                  pitchSort === "newest"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setPitchSort("random")}
                className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                  pitchSort === "random"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Random
              </button>
            </div>

            <div className="space-y-6 pb-20 md:pb-0">
              {isPitchModalOpen && (
                <CreatePitch
                  isOpen={isPitchModalOpen}
                  isInline={true}
                  onClose={() => setIsPitchModalOpen(false)}
                  onPitch={handleNewPitch}
                />
              )}

              {sortedPitches && sortedPitches.length > 0 ? (
                sortedPitches.map((pitch) => (
                  <PitchCard
                    key={pitch.id}
                    pitch={pitch}
                    onVote={handleVote}
                    onAddComment={handlePitchComment}
                    currentUser={currentUser}
                    onUserClick={handleUserClick}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-white/5 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  <Rocket className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-4">
                    No pitches yet. Be the first to launch an idea!
                  </p>
                  <button
                    onClick={() => setIsPitchModalOpen(true)}
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition-all"
                  >
                    Submit Your First Idea
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
      case "profile":
        return activeProfileUser ? (
          <ProfileView
            user={activeProfileUser}
            posts={posts}
            currentUser={currentUser}
            onBack={() => setActiveTab("home")}
            onDeletePost={handleRemovePost}
            onEditPost={handleEditPost}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddPostComment}
            onUserClick={handleUserClick}
            isFollowing={currentUser.followingIds.includes(
              activeProfileUser.id,
            )}
            onToggleFollow={handleToggleFollow}
            onMessageUser={(user) => {
              setChatPrefillUser(user);
              setActiveTab("chats");
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : null;
      default:
        return null;
    }
  };

  const handleTabChange = (
    tab:
      | "home"
      | "chats"
      | "community"
      | "discover"
      | "saved"
      | "ai-assistant"
      | "profile"
      | "launchpad",
  ) => {
    if (tab === "profile") {
      setActiveProfileUser(currentUser);
    }
    if (tab !== "chats") {
      setChatPrefillUser(null);
    }
    setActiveTab(tab);

    if (tab === "home") {
      setActiveCommunity(null);
      void refreshFeed();
    }
  };

  return (
    <Layout
      currentUser={currentUser}
      activeTab={
        activeTab === "community" ||
        activeTab === "discover" ||
        activeTab === "profile"
          ? "home"
          : activeTab
      }
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      posts={posts}
      theme={theme}
      toggleTheme={toggleTheme}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenPremium={() => setIsPremiumOpen(true)}
      onUserClick={handleUserClick}
    >
      {activeTab !== "chats" && activeTab !== "ai-assistant" && (
        <Sidebar
          activeTab={activeTab as any}
          onTabChange={handleTabChange as any}
          currentUser={currentUser}
          onOpenNetwork={() => setIsNetworkOpen(true)}
          onOpenPremium={() => setIsPremiumOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectCommunity={handleCommunitySelect}
          onDiscoverMore={() => setActiveTab("discover")}
          onLogout={handleLogout}
        />
      )}

      {renderContent()}

      {(activeTab === "home" ||
        activeTab === "discover" ||
        activeTab === "saved" ||
        activeTab === "profile") && (
        <RightPanel
          currentUserId={currentUser.id}
          followingMap={followingMap}
          onToggleFollow={handleToggleFollow}
        />
      )}

      {/* Modals */}
      <NetworkRequestsModal
        isOpen={isNetworkOpen}
        onClose={() => setIsNetworkOpen(false)}
        onAccept={() => {}}
      />
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        onSave={handleSettingsSave}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </Layout>
  );
};

export default App;
