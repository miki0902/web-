import type { Post, NewPost } from "../types/post";

type Props = {
    posts: Post[];
    onDelete: (postID: number) => void;
    onEdit: (post: Post, newPost: NewPost) => void;
};

export default function PostList({ posts, onDelete, onEdit }: Props) {
    return (
        <>
            {posts.map((post) => (
                <div key={post.id} className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                    <div className="post-actions">
                    <button onClick={() => onDelete(post.id)}>Delete</button>
                    <button onClick={() => {
                        const title = prompt("New Title", post.title);
                        const body = prompt("New Body", post.body);
                        if (title && body) {
                            onEdit(post, { title, body, userId: post.userId });
                        }
                    }}
                >
                    Edit
                    </button>
                </div>
                </div>
            ))}
        </>
    );
}