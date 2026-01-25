
import {useState, useEffect} from "react"
import type { Post, NewPost } from "./types/post";
import { fetchPosts, createPost, updatePost, deletePost } from "./api/posts";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";

function App() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        fetchPosts().then(setPosts).catch(console.error);
    }, []);

    const handleCreate = async (newPost: NewPost) => {
        const created = await createPost(newPost);
        setPosts((prev) => [created, ...prev]);
    };

    const handleEdit = async (post: Post, newPost: NewPost) => {
        const updated = await updatePost(post.id, newPost);
        setPosts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
        );
    };

    const handleDelete = async (postID: number) => {
        await deletePost(postID);
        setPosts((prev) => prev.filter((p) => p.id !== postID));
    };


    return (
        <div>
            <h1>Post Management</h1>
            <PostForm onSubmit={handleCreate} />
            <hr />
            <PostList
                posts={posts}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}

export default App;