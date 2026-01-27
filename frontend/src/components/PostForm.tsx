import { useState } from "react";
import type { NewPost } from "../types/post";
import { Button, TextField, Stack, Typography } from "@mui/material";

type Props = {
    onSubmit: (newPost: NewPost) => void;
};

export default function PostForm({ onSubmit }: Props) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const handleSubmit = () => {
        if (!title || !body) return;
        onSubmit({ title, body, userId: 1 });
        setTitle("");
        setBody("");
    };

    return (
        <Stack 
            spacing={2}
            sx={{ 
                backgroundColor: "background.paper",
                p: 3,
                borderRadius: 2,
            }}
        >
            <Typography variant="h5">Create New Post</Typography>
            <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
                label="Body"
                multiline
                minRows={3}
                value = {body}
                onChange={(e) => setBody(e.target.value)}
            />

            <Button variant="contained" onClick={handleSubmit}>Post</Button>
        </Stack>
        
    );
}