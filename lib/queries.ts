// lib/queries.ts
import { sql } from "./db";

export type User = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export async function createUser(username: string, email: string, password_hash: string): Promise<User> {
  const rows = await sql`
    INSERT INTO users (username, email, password_hash)
    VALUES (${username}, ${email}, ${password_hash})
    RETURNING *;
  `;
  return rows[0] as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1;`;
  return (rows[0] as User) ?? null;
}

export type Post = {
  id: string;
  user_id: string;
  title: string;
  content_html: string;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(baseTitle: string) {
  const base = toSlug(baseTitle) || "post";
  const rows = await sql`SELECT slug FROM posts WHERE slug LIKE ${base + "%"}`;
  const taken = new Set((rows as Array<{ slug: string }>).map(r => r.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export async function createPost(input: {
  user_id: string; title: string; content_html: string; cover_image_url?: string | null; is_public?: boolean;
}) {
  const rows = await sql`
    INSERT INTO posts (user_id, title, content_html, cover_image_url, is_public, slug)
    VALUES (${input.user_id}, ${input.title}, ${input.content_html}, ${input.cover_image_url ?? null}, ${input.is_public ?? true}, ${await generateUniqueSlug(input.title)})
    RETURNING *;
  `;
  return rows[0];
}

export async function likePost(user_id: string, post_id: string) {
  await sql`INSERT INTO post_likes (user_id, post_id) VALUES (${user_id}, ${post_id})
            ON CONFLICT DO NOTHING;`;
}

export async function unlikePost(user_id: string, post_id: string) {
  await sql`DELETE FROM post_likes WHERE user_id = ${user_id} AND post_id = ${post_id};`;
}

export async function sharePost(user_id: string, post_id: string) {
  await sql`INSERT INTO post_shares (user_id, post_id) VALUES (${user_id}, ${post_id})
            ON CONFLICT DO NOTHING;`;
}

export async function follow(follower_id: string, following_id: string) {
  await sql`INSERT INTO follows (follower_id, following_id) VALUES (${follower_id}, ${following_id})
            ON CONFLICT DO NOTHING;`;
}

export async function unfollow(follower_id: string, following_id: string) {
  await sql`DELETE FROM follows WHERE follower_id = ${follower_id} AND following_id = ${following_id};`;
}

export async function getPostStats(post_id: string) {
  const likesRows = await sql`SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = ${post_id};`;
  const sharesRows = await sql`SELECT COUNT(*)::int as count FROM post_shares WHERE post_id = ${post_id};`;
  return {
    likes: Number((likesRows[0] as any)?.count ?? 0),
    shares: Number((sharesRows[0] as any)?.count ?? 0),
  };
}

export async function getUserStats(user_id: string) {
  const followersRows = await sql`SELECT COUNT(*)::int as count FROM follows WHERE following_id = ${user_id};`;
  const followingRows = await sql`SELECT COUNT(*)::int as count FROM follows WHERE follower_id = ${user_id};`;
  return {
    followers: Number((followersRows[0] as any)?.count ?? 0),
    following: Number((followingRows[0] as any)?.count ?? 0),
  };
}

export async function replacePostImages(post_id: string, urls: string[]) {
  await sql`DELETE FROM post_images WHERE post_id = ${post_id};`;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    await sql`
      INSERT INTO post_images (post_id, url, position)
      VALUES (${post_id}, ${url}, ${i})
      ON CONFLICT (post_id, position) DO UPDATE SET url = EXCLUDED.url;
    `;
  }
}

export async function getPost(id: string) {
  const rows = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1;`;
  return rows[0] ?? null;
}

export async function getPostBySlug(slug: string) {
  const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1;`;
  return rows[0] ?? null;
}

export async function listPosts(limit = 20, offset = 0) {
  return await sql`
    SELECT id, title, slug, cover_image_url, created_at
    FROM posts
    WHERE is_public = true
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
}

export async function listPostsByUser(userId: string, limit = 20, offset = 0) {
  const rows = await sql`
    SELECT id, title, slug, cover_image_url, created_at
    FROM posts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
  return rows as any[];
}

export async function listPostsWithContent(limit = 30, offset = 0) {
  return await sql`
    SELECT id, title, slug, cover_image_url, created_at, content_html
    FROM posts
    WHERE is_public = true
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
}

export async function listPostsByUserWithContent(userId: string, limit = 20, offset = 0) {
  return await sql`
    SELECT id, title, slug, cover_image_url, created_at, content_html
    FROM posts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
}

export async function listTopLikedPosts(limit = 10) {
  return await sql`
    SELECT
      p.id, p.title, p.slug, p.cover_image_url, p.created_at, p.content_html,
      COALESCE(COUNT(pl.user_id), 0)::int AS likes
    FROM posts p
    LEFT JOIN post_likes pl ON pl.post_id = p.id
    WHERE p.is_public = true
    GROUP BY p.id
    ORDER BY likes DESC, p.created_at DESC
    LIMIT ${limit};
  `;
}

export async function listTopSharedPosts(limit = 10) {
  return await sql`
    SELECT
      p.id, p.title, p.slug, p.cover_image_url, p.created_at, p.content_html,
      COALESCE(COUNT(ps.user_id), 0)::int AS shares
    FROM posts p
    LEFT JOIN post_shares ps ON ps.post_id = p.id
    WHERE p.is_public = true
    GROUP BY p.id
    ORDER BY shares DESC, p.created_at DESC
    LIMIT ${limit};
  `;
}
