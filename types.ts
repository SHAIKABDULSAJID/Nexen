export interface User {
  id: string;
  name: string;
  username: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  avatar: string;
  bio: string;
  followingIds: string[];
  followerIds: string[];
}

export interface PostComment {
  id: string;
  userId: string;
  user: User;
  text: string;
  timestamp: string;
  parentCommentId?: string; // For nested replies
}

export interface Pitch {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  votes: number;
  comments: number;
  commentList: PostComment[];
  category: string;
  timestamp: string;
  votedBy: string[];
  isTrending?: boolean;
  supportersCount?: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  likedByUsers?: User[];
  commentList: PostComment[];
  reposts: number;
  reposterList: User[];
  timestamp: string;
  tags: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participant: User;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
}

export interface Community {
  id: string;
  name: string;
  members: string;
  icon: string;
}
