import type { Post, NewPost } from "../types/post";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchPosts(): Promise<Post[]> {
    const response = await fetch(`${BASE_URL}/posts`);
    if (!response.ok) throw new Error("Failed to fetch posts");
    return response.json();
}

export async function createPost(newPost: NewPost): Promise<Post> {
    const response = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(newPost),
    });
    if (!response.ok) throw new Error("Failed to create post");
    return response.json();
}

export async function updatePost(
    postID: number,
    newPost: NewPost,
): Promise<Post> {
    const response = await fetch(`${BASE_URL}/posts/${postID}`,{
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(newPost),
    });
    if (!response.ok) throw new Error("Failed to update post");
    return response.json();
}

export async function deletePost(postID: number): Promise<void>{
    const response = await fetch(`${BASE_URL}/posts/${postID}`,{
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete post");
}