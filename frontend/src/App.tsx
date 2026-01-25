import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

type NewPost = {
  title: string;
  body: string;
  userId: number;
};

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // GET
  useEffect(() => {
    fetch("http://localhost:8000/posts")
      .then((res) => {
        if (!res.ok) {
          throw new Error("GET error");
        }
        return res.json();
      })
      .then((data: Post[]) => {
        setPosts(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // POST
  const handleSubmit = () => {
    const newPost: NewPost = {
      title,
      body,
      userId: 1,
    };

    fetch("http://localhost:8000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("POST error");
        }
        return res.json();
      })
      .then((createdPost: Post) => {
        setPosts((prev) => [createdPost, ...prev]);
        setTitle("");
        setBody("");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // PUT
  const handleEdit = (post: Post) => {
    const newTitle = prompt("New title", post.title);
    const newBody = prompt("New body", post.body);
  
    if (!newTitle || !newBody) return;
  
    fetch(`http://localhost:8000/posts/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        body: newBody,
        userId: post.userId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("PUT error");
        return res.json();
      })
      .then((updatedPost: Post) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
      })
      .catch(console.error);
  };
  
  // DELETE
  const handleDelete = (id: number) => {
    fetch(`http://localhost:8000/posts/${id}`, {
        method: "DELETE",
    })
      .then((res) => {
      if (!res.ok) {
        throw new Error("DELETE error");
      }
      setPosts((prev) => prev.filter((post)=> post.id !== id));
    })
    .catch(console.error);
};



  return (
    <div>
      <h1>Posts</h1>

      <h2>New Post</h2>
      <input
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit}>Post</button>

      <hr />

      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <p>{post.userId}</p>
          <p> {post.id} </p>
          <button onClick={() => handleDelete(post.id)}>Delete</button>
          <button onClick={() => handleEdit(post)}>Edit</button>
        </div>
      ))}
    </div>
  );
}

export default App;
