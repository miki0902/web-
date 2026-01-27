import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Stack,
} from "@mui/material";
import type { Post, NewPost } from "../types/post";

type Props = {
    posts: Post[];
    onDelete: (postID: number) => void;
    onEdit: (post: Post, newPost: NewPost) => void;
};

export default function PostList({ posts, onDelete, onEdit }: Props) {
    return (
        <Stack spacing={2}> {/* スタックレイアウト */}
            {posts.map((post) => (
                <Card key={post.id}> {/* カード */}
                    <CardContent> {/* カードコンテンツ */}
                        <Typography variant="h6" gutterBottom> {/* タイトル */}
                            {post.title}
                        </Typography>

                        <Typography variant="body1"> {/* 本文 */}
                            {post.body}
                        </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "flex-end" }}> {/* ボタンを右寄せ */}
                        <Button 
                            size="small"
                            color="error"
                            onClick={() => onDelete(post.id)}
                        >
                            Delete
                        </Button>

                        <Button
                            size="small"
                            onClick={() => {
                                const title = prompt("New Title", post.title);
                                const body = prompt("New Body", post.body);
                                if (!title ||!body ) return;
                                
                                onEdit(post, { title, body, userId: post.userId });
                            }}
                        >
                            Edit
                        </Button>
                    </CardActions>
                </Card>
            ))}
        </Stack>
    )
}