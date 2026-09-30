export type CommunityRole = 'owner' | 'moderator' | 'member';
export type MediaKind = 'image' | 'video';
export type MediaStatus = 'pending' | 'ready';
export type VoteValue = -1 | 0 | 1;
export type PostSort = 'new' | 'top';
export type CommentSort = 'top' | 'new' | 'old';

export interface Page {
  limit?: number;
  offset?: number;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  name: string;
  image: string | null;
  avatarMediaId: string | null;
  bio: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Me extends User {
  avatarUrl: string | null;
}

export interface Profile {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
  bio: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export interface Author {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
}

export interface Community {
  id: string;
  name: string;
  title: string;
  description: string;
  iconMediaId: string | null;
  bannerMediaId: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  createdById: string;
  memberCount: number;
  viewerRole: CommunityRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  user: Author;
  role: CommunityRole;
  joinedAt: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: TiptapMark[];
  content?: TiptapNode[];
}

export interface MediaInfo {
  url: string;
  kind: MediaKind;
  mimeType: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
}

export interface Thread {
  id: string;
  community?: { id: string; name: string };
  author: Author | null;
  parentId: string | null;
  rootId: string | null;
  depth: number;
  title: string | null;
  body: TiptapNode | null;
  pinned: boolean;
  locked: boolean;
  score: number;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  commentCount: number;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  viewerVote: VoteValue;
  saved: boolean;
  media?: Record<string, MediaInfo>;
  replies?: Thread[];
}

export interface VoteResult {
  score: number;
  upvotes: number;
  downvotes: number;
  viewerVote: VoteValue;
}

export interface Media {
  id: string;
  kind: MediaKind;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  status: MediaStatus;
  url: string | null;
  createdAt: string;
}

export interface Upload {
  url: string;
  fields: Record<string, string>;
  expiresAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}
