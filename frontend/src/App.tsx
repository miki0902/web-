
import {useState, useEffect} from "react"
import type { Post, NewPost } from "./types/post";
import { fetchPosts, createPost, updatePost, deletePost } from "./api/posts";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";

function App() {
    const [posts, setPosts] = useState<Post[]>([]);
    // 初回ロード時にAPIを通じてJSON形式のデータを取得してpostsに格納
    useEffect(() => {
        fetchPosts().then(setPosts).catch(console.error);
    }, []);

    // PostFormから呼ばれる作成処理
    const handleCreate = async (newPost: NewPost) => {
        const created = await createPost(newPost); 
        setPosts((prev) => [created, ...prev]); // 作成したデータを先頭に追加
    };

    // PostListから呼ばれる編集処理
    const handleEdit = async (post: Post, newPost: NewPost) => {
        const updated = await updatePost(post.id, newPost);
        setPosts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)) // 一覧から該当IDのデータを更新
        );
    };

    const handleDelete = async (postID: number) => {
        await deletePost(postID);
        setPosts((prev) => prev.filter((p) => p.id !== postID)); // 一覧から該当IDのデータを削除
    };


    return (
        <div>
            <h1>Post Management</h1>
            {/* PostFormから呼ばれる作成処理 */}
            <PostForm onSubmit={handleCreate} /> 
            <hr />
            {/* PostListから呼ばれる一覧表示処理 */}
            <PostList
                posts={posts} // 一覧表示するデータ
                onDelete={handleDelete} // PostListから呼ばれる削除処理
                onEdit={handleEdit} // PostListから呼ばれる編集処理
            />
        </div>
    );
}

export default App;