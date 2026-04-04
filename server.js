import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { User } from "./models/User";
import { Post } from "./models/Post";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.config();
const DEFAULT_AVATAR_PATH = "/default-avatar.svg";
const resolveAvatar = (avatar) =>
  avatar && avatar.trim().length > 0 ? avatar : DEFAULT_AVATAR_PATH;
const fallbackUser = (id, name = "Unknown User") => ({
  id,
  name,
  username: "unknown",
  email: "",
  avatar: DEFAULT_AVATAR_PATH,
  bio: "",
  role: "",
  company: "",
  location: "",
  website: "",
  phone: "",
  followingIds: [],
  followerIds: [],
});
const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  avatar: resolveAvatar(user.avatar),
  bio: user.bio,
  role: user.role,
  company: user.company,
  location: user.location,
  website: user.website,
  phone: user.phone,
  followingIds: user.followingIds || [],
  followerIds: user.followerIds || [],
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3002;
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error(
      "❌ Missing MONGODB_URI. Set your MongoDB Atlas connection string in .env",
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
  // Authentication middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }
    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
      (err, user) => {
        if (err) {
          return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
      },
    );
  };
  const serializePost = async (post) => {
    const author = await User.findById(post.userId);
    const likedByIds = post.likedByIds || [];
    const likedUsers = await User.find({ _id: { $in: likedByIds } });
    const likedByUsers = likedUsers.map((u) => serializeUser(u));
    const comments = post.commentList || [];
    const commentUserIdsRaw = comments
      .map((c) => c.userId)
      .filter((id) => typeof id === "string" && id.length > 0);
    const commentUserIds = [...new Set(commentUserIdsRaw)];
    const commentUsers = await User.find({ _id: { $in: commentUserIds } });
    const commentUsersMap = new Map(
      commentUsers.map((u) => [u._id.toString(), serializeUser(u)]),
    );
    return {
      id: post._id,
      userId: post.userId,
      user: author
        ? serializeUser(author)
        : fallbackUser(post.userId || `deleted-${post._id}`, "Deleted User"),
      content: post.content,
      image: post.image,
      likes: post.likes || 0,
      comments: post.comments || 0,
      commentList: comments.map((comment) => ({
        id: comment._id?.toString() || `c-${Date.now()}`,
        userId: comment.userId,
        user:
          commentUsersMap.get(comment.userId) ||
          fallbackUser(
            comment.userId || "unknown-comment-user",
            "Deleted User",
          ),
        text: comment.text,
        parentCommentId: comment.parentCommentId,
        timestamp: new Date(
          comment.timestamp || post.createdAt || new Date(),
        ).toISOString(),
      })),
      likedByUsers,
      reposts: post.reposts,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  };
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email, and password are required" });
      }
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        username: email.split("@")[0] + Math.random().toString(36).substr(2, 5), // Generate temporary username
        avatar: DEFAULT_AVATAR_PATH,
        bio: "",
        followingIds: [],
        followerIds: [],
      });
      await user.save();
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );
      res.status(201).json({
        token,
        user: serializeUser(user),
        isNewUser: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Check password
      if (!user.password) {
        return res
          .status(401)
          .json({ error: "Please use Google sign-in for this account" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );
      res.json({
        token,
        user: serializeUser(user),
        isNewUser: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { name, email, googleId } = req.body;
      if (!email || !googleId) {
        return res
          .status(400)
          .json({ error: "Email and Google ID are required" });
      }
      // Find or create user
      let isNewUser = false;
      let user = await User.findOne({ googleId });
      if (!user) {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = googleId;
          await existingUser.save();
          user = existingUser;
          isNewUser = false;
        } else {
          // Create new user
          user = new User({
            name,
            email,
            googleId,
            username:
              email.split("@")[0] + Math.random().toString(36).substr(2, 5),
            avatar: DEFAULT_AVATAR_PATH,
            bio: "",
            followingIds: [],
            followerIds: [],
          });
          await user.save();
          isNewUser = true;
        }
      }
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );
      res.json({
        token,
        user: serializeUser(user),
        isNewUser,
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Failed to authenticate with Google" });
    }
  });
  // Profile Routes
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(serializeUser(user));
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });
  app.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const updates = req.body;
      const userId = req.user.userId;
      if ("avatar" in updates) {
        updates.avatar = resolveAvatar(updates.avatar);
      }
      // Check if username is taken by another user
      if (updates.username) {
        const existingUser = await User.findOne({ username: updates.username });
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }
      const user = await User.findByIdAndUpdate(
        userId,
        { ...updates, updatedAt: new Date() },
        { new: true },
      );
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(serializeUser(user));
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app.get("/api/users/search", async (req, res) => {
    try {
      const query = req.query.q || "";
      let users;
      if (query.trim() === "") {
        // Return all users if no query
        users = await User.find({}).limit(50);
      } else {
        // Search by name or username
        const lowerQuery = query.toLowerCase();
        users = await User.find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        }).limit(50);
      }
      const serializedUsers = users.map(serializeUser);
      res.json(serializedUsers);
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });
  app.get("/api/users/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = String(req.params.userId);
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(serializeUser(user));
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });
  app.post("/api/users/:userId/follow", authenticateToken, async (req, res) => {
    try {
      const currentUserId = req.user.userId;
      const targetUserId = String(req.params.userId);
      if (currentUserId === targetUserId) {
        return res.status(400).json({ error: "You cannot follow yourself" });
      }
      const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(targetUserId),
      ]);
      if (!currentUser || !targetUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const isFollowing = currentUser.followingIds.includes(targetUserId);
      if (isFollowing) {
        currentUser.followingIds = currentUser.followingIds.filter(
          (id) => id !== targetUserId,
        );
        targetUser.followerIds = targetUser.followerIds.filter(
          (id) => id !== currentUserId,
        );
      } else {
        if (!currentUser.followingIds.includes(targetUserId)) {
          currentUser.followingIds.push(targetUserId);
        }
        if (!targetUser.followerIds.includes(currentUserId)) {
          targetUser.followerIds.push(currentUserId);
        }
      }
      await Promise.all([currentUser.save(), targetUser.save()]);
      res.json({
        isFollowing: !isFollowing,
        currentUser: serializeUser(currentUser),
        targetUser: serializeUser(targetUser),
      });
    } catch (error) {
      console.error("Follow toggle error:", error);
      res.status(500).json({ error: "Failed to update follow status" });
    }
  });
  // Post Routes
  app.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      const { content, image, tags } = req.body;
      const userId = req.user.userId;
      if (!content && !image) {
        return res
          .status(400)
          .json({ error: "Post must include content or an image" });
      }
      const post = new Post({
        userId,
        content,
        image,
        tags: tags || [],
        likes: 0,
        comments: 0,
        likedByIds: [],
        commentList: [],
        reposts: 0,
      });
      await post.save();
      res.status(201).json(await serializePost(post));
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });
  app.get("/api/posts/user/me", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const posts = await Post.find({ userId }).sort({ createdAt: -1 });
      const postsWithUser = await Promise.all(posts.map(serializePost));
      res.json(postsWithUser);
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });
  app.get("/api/posts/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await Post.find({ userId }).sort({ createdAt: -1 });
      const postsWithUser = await Promise.all(posts.map(serializePost));
      res.json(postsWithUser);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 }).limit(100);
      const postsWithUser = await Promise.all(posts.map(serializePost));
      res.json(postsWithUser);
    } catch (error) {
      console.error("Get all posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });
  app.delete("/api/posts/:postId", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      if (post.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this post" });
      }
      await Post.findByIdAndDelete(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });
  app.put("/api/posts/:postId", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const { content, image } = req.body;
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      if (post.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Unauthorized to edit this post" });
      }
      const nextContent = typeof content === "string" ? content.trim() : "";
      const nextImage = typeof image === "string" ? image.trim() : "";
      if (!nextContent && !nextImage) {
        return res
          .status(400)
          .json({ error: "Post must include content or an image" });
      }
      post.content = nextContent;
      post.image = nextImage || undefined;
      post.tags = nextContent.match(/#\w+/g)?.map((t) => t.slice(1)) || [];
      await post.save();
      res.json(await serializePost(post));
    } catch (error) {
      console.error("Edit post error:", error);
      res.status(500).json({ error: "Failed to edit post" });
    }
  });
  app.post("/api/posts/:postId/like", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      post.likedByIds = post.likedByIds || [];
      const alreadyLiked = post.likedByIds.includes(userId);
      if (alreadyLiked) {
        post.likedByIds = post.likedByIds.filter((id) => id !== userId);
      } else {
        post.likedByIds.push(userId);
      }
      post.likes = post.likedByIds.length;
      await post.save();
      res.json(await serializePost(post));
    } catch (error) {
      console.error("Like post error:", error);
      res.status(500).json({ error: "Failed to update like" });
    }
  });
  app.post(
    "/api/posts/:postId/comments",
    authenticateToken,
    async (req, res) => {
      try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const { text } = req.body;
        if (!text || !String(text).trim()) {
          return res.status(400).json({ error: "Comment text is required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        post.commentList = post.commentList || [];
        post.commentList.unshift({
          userId,
          text: String(text).trim(),
          timestamp: new Date(),
        });
        post.comments = post.commentList.length;
        await post.save();
        res.json(await serializePost(post));
      } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ error: "Failed to add comment" });
      }
    },
  );
  // Reply to a comment
  app.post(
    "/api/posts/:postId/comments/:commentId/reply",
    authenticateToken,
    async (req, res) => {
      try {
        const { postId, commentId } = req.params;
        const userId = req.user.userId;
        const { text } = req.body;
        if (!text || !String(text).trim()) {
          return res.status(400).json({ error: "Reply text is required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        // Find the parent comment
        const parentComment = post.commentList.find(
          (c) => c._id?.toString() === commentId,
        );
        if (!parentComment) {
          return res.status(404).json({ error: "Comment not found" });
        }
        post.commentList = post.commentList || [];
        post.commentList.push({
          userId,
          text: String(text).trim(),
          timestamp: new Date(),
          parentCommentId: commentId,
        });
        post.comments = post.commentList.length;
        await post.save();
        res.json(await serializePost(post));
      } catch (error) {
        console.error("Reply to comment error:", error);
        res.status(500).json({ error: "Failed to add reply" });
      }
    },
  );
  // Edit a comment
  app.put(
    "/api/posts/:postId/comments/:commentId",
    authenticateToken,
    async (req, res) => {
      try {
        const { postId, commentId } = req.params;
        const userId = req.user.userId;
        const { text } = req.body;
        if (!text || !String(text).trim()) {
          return res.status(400).json({ error: "Comment text is required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        const comment = post.commentList.find(
          (c) => c._id?.toString() === commentId,
        );
        if (!comment) {
          return res.status(404).json({ error: "Comment not found" });
        }
        // Check ownership
        if (comment.userId !== userId) {
          return res
            .status(403)
            .json({ error: "You can only edit your own comments" });
        }
        comment.text = String(text).trim();
        comment.timestamp = new Date();
        await post.save();
        res.json(await serializePost(post));
      } catch (error) {
        console.error("Edit comment error:", error);
        res.status(500).json({ error: "Failed to edit comment" });
      }
    },
  );
  // Delete a comment
  app.delete(
    "/api/posts/:postId/comments/:commentId",
    authenticateToken,
    async (req, res) => {
      try {
        const { postId, commentId } = req.params;
        const userId = req.user.userId;
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
        const commentIndex = post.commentList.findIndex(
          (c) => c._id?.toString() === commentId,
        );
        if (commentIndex === -1) {
          return res.status(404).json({ error: "Comment not found" });
        }
        const comment = post.commentList[commentIndex];
        // Check ownership
        if (comment.userId !== userId) {
          return res
            .status(403)
            .json({ error: "You can only delete your own comments" });
        }
        // Remove the comment and any replies to it
        post.commentList = post.commentList.filter((c, idx) =>
          idx === commentIndex ? false : c.parentCommentId !== commentId,
        );
        post.comments = post.commentList.length;
        await post.save();
        res.json(await serializePost(post));
      } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ error: "Failed to delete comment" });
      }
    },
  );
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });
  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      const ai = new GoogleGenAI({ apiKey });
      const contextText =
        context && context.length > 0
          ? context
              .map((p) => `Post by ${p.user.name}: ${p.content}`)
              .join("\n\n")
          : "No saved posts yet.";
      const prompt = `
        You are an AI assistant helping a user on a tech social network called Nexen.
        Here are the user's saved posts for context:
        ${contextText}

        User question: ${message}
        
        Answer the user's question. If it relates to their saved posts, use the context provided. Otherwise, provide a helpful general response about tech, startups, or professional networking. Keep it concise and friendly.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const responseText = response.text || "I couldn't generate a response.";
      res.json({ response: responseText });
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: "Failed to process AI request" });
    }
  });
  // AI Summarize endpoint
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Summarize this post in one sentence: ${content}`,
      });
      const summary = response.text || "Could not generate summary.";
      res.json({ summary });
    } catch (error) {
      console.error("AI Summarize error:", error);
      res.status(500).json({ error: "Failed to summarize content" });
    }
  });
  // Pitch submission endpoint (no auth required for testing)
  app.post("/api/pitches", async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const userId = req.userId || "guest";
      if (!title || !description || !category) {
        return res.status(400).json({
          error: "Title, description, and category are required",
        });
      }
      if (title.trim().length === 0 || description.trim().length === 0) {
        return res.status(400).json({
          error: "Title and description cannot be empty",
        });
      }
      // Create pitch object
      const pitch = {
        id: `pitch_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        userId,
        createdAt: new Date(),
        upvotes: 0,
        comments: [],
      };
      // TODO: Save to database when Pitch model is created
      // await Pitch.create(pitch);
      res.status(201).json({
        success: true,
        message: "Pitch submitted successfully!",
        pitch,
      });
    } catch (error) {
      console.error("Pitch submission error:", error);
      res.status(500).json({ error: "Failed to submit pitch" });
    }
  });
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
startServer();
