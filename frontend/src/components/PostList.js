import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./../styles/PostList.css";

function PostList({ category }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword = searchParams.get("keyword");
  const filterBy = searchParams.get("filterBy");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      try {
        let endpoint = "http://localhost:7000/api/posts";

        if (keyword && filterBy) {
          endpoint += filterBy === "title" 
            ? `/search/title?keyword=${encodeURIComponent(keyword)}` 
            : `/search/author?keyword=${encodeURIComponent(keyword)}`;
        } else if (category) {
          endpoint += `?category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 400) {
            throw new Error("Invalid search value.");
          } else if (response.status === 404) {
            throw new Error(`No results found for "${keyword}".`);
          } else {
            throw new Error(`Error: ${response.status}`);
          }
        }

        const data = await response.json();
        setPosts(data);
        setError(null); // Clear error
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]); // Clear posts on error
        setError(err.message); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, keyword, filterBy]);

  if (loading) {
    return <div className="post-list">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="post-list">
        <h2 style={{ fontWeight: "bold", margin: "20px 0" }}>{error}</h2>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="post-list">
        <h2 style={{ fontWeight: "bold", margin: "20px 0" }}>
          No results found for "{keyword}".
        </h2>
      </div>
    );
  }

  return (
    <div className="post-list">
      {keyword && (
        <h2 style={{ fontWeight: "bold", margin: "20px 0" }}>
          Search Results: "{keyword}"
        </h2>
      )}
      {posts.map((post) => (
        <div
          className="post-card"
          key={post._id}
          onClick={() => navigate(`/posts/${post._id}`)}
        >
          <h2>{post.title}</h2>
          <p>Category: {post.category}</p>
          <p>Author: {post.author?.name || "Unknown"}</p>
          <p>Views: {post.views}</p>
        </div>
      ))}
    </div>
  );
}

export default PostList;
