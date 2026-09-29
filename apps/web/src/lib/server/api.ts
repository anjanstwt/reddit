import { request } from './fetcher';
import type {
  AuthResponse,
  AuthTokens,
  CommentSort,
  Community,
  CommunityRole,
  Me,
  Media,
  Member,
  Page,
  PostSort,
  Profile,
  Thread,
  TiptapNode,
  Upload,
  VoteResult,
  VoteValue,
} from './types';

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  auth: {
    google: (idToken: string) => request<AuthResponse>('/auth/google', { method: 'POST', body: json({ idToken }) }),
    refresh: (refreshToken: string) =>
      request<AuthTokens>('/auth/refresh', { method: 'POST', body: json({ refreshToken }) }),
  },

  users: {
    me: (token: string) => request<Me>('/users/me', { token }),
    updateMe: (
      body: { username?: string; name?: string; bio?: string; avatarMediaId?: string },
      token: string,
    ) => request<Me>('/users/me', { method: 'PATCH', body: json(body), token }),
    get: (username: string) => request<Profile>(`/users/${username}`),
    follow: (username: string, token: string) => request<null>(`/users/${username}/follow`, { method: 'POST', token }),
    unfollow: (username: string, token: string) =>
      request<null>(`/users/${username}/follow`, { method: 'DELETE', token }),
    followers: (username: string, page: Page = {}) =>
      request<Profile[]>(`/users/${username}/followers`, { query: { ...page } }),
    following: (username: string, page: Page = {}) =>
      request<Profile[]>(`/users/${username}/following`, { query: { ...page } }),
    threads: (username: string, params: Page & { type?: 'posts' | 'comments' } = {}, token?: string) =>
      request<Thread[]>(`/users/${username}/threads`, { query: { ...params }, token }),
    feed: (params: Page & { sort?: PostSort }, token: string) =>
      request<Thread[]>('/users/me/feed', { query: { ...params }, token }),
    saved: (page: Page, token: string) => request<Thread[]>('/users/me/saved', { query: { ...page }, token }),
    communities: (page: Page, token: string) =>
      request<Community[]>('/users/me/communities', { query: { ...page }, token }),
  },

  communities: {
    list: (params: Page & { q?: string } = {}, token?: string) =>
      request<Community[]>('/communities', { query: { ...params }, token }),
    create: (body: { name: string; title: string; description?: string }, token: string) =>
      request<Community>('/communities', { method: 'POST', body: json(body), token }),
    get: (name: string, token?: string) => request<Community>(`/communities/${name}`, { token }),
    update: (
      name: string,
      body: { title?: string; description?: string; iconMediaId?: string; bannerMediaId?: string },
      token: string,
    ) => request<Community>(`/communities/${name}`, { method: 'PATCH', body: json(body), token }),
    join: (name: string, token: string) => request<null>(`/communities/${name}/join`, { method: 'POST', token }),
    leave: (name: string, token: string) => request<null>(`/communities/${name}/join`, { method: 'DELETE', token }),
    posts: (name: string, params: Page & { sort?: PostSort } = {}, token?: string) =>
      request<Thread[]>(`/communities/${name}/threads`, { query: { ...params }, token }),
    createPost: (name: string, body: { title: string; body?: TiptapNode }, token: string) =>
      request<Thread>(`/communities/${name}/threads`, { method: 'POST', body: json(body), token }),
    members: (name: string, params: Page & { role?: CommunityRole } = {}) =>
      request<Member[]>(`/communities/${name}/members`, { query: { ...params } }),
    setRole: (name: string, username: string, role: 'moderator' | 'member', token: string) =>
      request<Member>(`/communities/${name}/members/${username}/role`, {
        method: 'PUT',
        body: json({ role }),
        token,
      }),
  },

  threads: {
    all: (params: Page & { sort?: PostSort } = {}, token?: string) =>
      request<Thread[]>('/threads', { query: { ...params }, token }),
    get: (id: string, token?: string) => request<Thread>(`/threads/${id}`, { token }),
    comments: (id: string, sort: CommentSort = 'top', token?: string) =>
      request<Thread[]>(`/threads/${id}/comments`, { query: { sort }, token }),
    reply: (id: string, body: TiptapNode, token: string) =>
      request<Thread>(`/threads/${id}/replies`, { method: 'POST', body: json({ body }), token }),
    update: (id: string, body: TiptapNode, token: string) =>
      request<Thread>(`/threads/${id}`, { method: 'PATCH', body: json({ body }), token }),
    remove: (id: string, token: string) => request<null>(`/threads/${id}`, { method: 'DELETE', token }),
    vote: (id: string, value: VoteValue, token: string) =>
      request<VoteResult>(`/threads/${id}/vote`, { method: 'PUT', body: json({ value }), token }),
    save: (id: string, token: string) => request<null>(`/threads/${id}/save`, { method: 'POST', token }),
    unsave: (id: string, token: string) => request<null>(`/threads/${id}/save`, { method: 'DELETE', token }),
    pin: (id: string, pinned: boolean, token: string) =>
      request<Thread>(`/threads/${id}/pin`, { method: 'PUT', body: json({ pinned }), token }),
    lock: (id: string, locked: boolean, token: string) =>
      request<Thread>(`/threads/${id}/lock`, { method: 'PUT', body: json({ locked }), token }),
  },

  media: {
    createUpload: (body: { mimeType: string; sizeBytes: number }, token: string) =>
      request<{ media: Media; upload: Upload }>('/media/uploads', { method: 'POST', body: json(body), token }),
    complete: (id: string, body: { width?: number; height?: number; durationMs?: number }, token: string) =>
      request<Media>(`/media/${id}/complete`, { method: 'POST', body: json(body), token }),
    get: (id: string, token?: string) => request<Media>(`/media/${id}`, { token }),
    uploadFile: async (file: File, token: string, dimensions: { width?: number; height?: number } = {}) => {
      const { media, upload } = await api.media.createUpload({ mimeType: file.type, sizeBytes: file.size }, token);

      const form = new FormData();
      for (const [key, value] of Object.entries(upload.fields)) form.append(key, value);
      form.append('file', file);
      const res = await fetch(upload.url, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`upload failed with status ${res.status}`);

      return api.media.complete(media.id, dimensions, token);
    },
  },
};
