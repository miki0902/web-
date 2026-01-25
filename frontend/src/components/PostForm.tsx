import { useState } from "react";
import type { NewPost } from "../types/post";

type Props = {
    onSubmit: (newPost: NewPost) => void;
};

export default function PostForm({ onSubmit }: Props) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const handleSubmit = () => {
        onSubmit({ title, body, userId: 1 });
        setTitle("");
        setBody("");
    };

    return (
        <>
            <h2>Create New Post</h2>
            <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <textarea
                placeholder="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />
            <br />
            <button onClick={handleSubmit}>Post</button>
        </>
    );
}