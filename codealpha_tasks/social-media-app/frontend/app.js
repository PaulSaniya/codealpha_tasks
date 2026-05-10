const API = "http://localhost:5000/api";

// ==========================
// 🔐 AUTH HELPERS
// ==========================
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

// 🔐 Redirect if not logged in
if (!getToken()) {
  window.location.href = "login.html";
}

// ==========================
// 🧠 SET NAVBAR AVATAR
// ==========================
function setNavbarAvatar() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  const avatar = document.getElementById("navAvatar");

  if (avatar) {
    avatar.innerText = user.username.charAt(0).toUpperCase();
  }
}

setNavbarAvatar();


// ==========================
// ✅ CREATE POST
// ==========================
async function createPost() {
  const content = document.getElementById("postContent").value;
  const file = document.getElementById("file").files[0];

  if (!content && !file) {
    return alert("Write something or upload image");
  }

  const formData = new FormData();
  formData.append("content", content);
  if (file) formData.append("file", file);

  try {
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getToken()
      },
      body: formData
    });

    if (!res.ok) {
      return alert("Post failed (Auth issue)");
    }

    document.getElementById("postContent").value = "";
    document.getElementById("file").value = "";

    loadPosts();

  } catch (err) {
    console.log(err);
  }
}

// ==========================
// 📥 LOAD POSTS
// ==========================
async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts`);

    if (!res.ok) return;

    const posts = await res.json();

    const feed = document.getElementById("feed");
    if (!feed) return;

    feed.innerHTML = "";

    if (!Array.isArray(posts)) return;

    posts.forEach(post => {

      const commentsHTML = (post.comments || []).map(comment => `
        <div class="comment">
          <div class="avatar small">
            ${(comment.user?.username?.charAt(0) || "U").toUpperCase()}
          </div>

          <div>
            <b>${comment.user?.username || "User"}</b>
            <p>${comment.text}</p>
          </div>
        </div>
      `).join("");

      feed.innerHTML += `
        <div class="post">

          <div class="user-info">
            <div class="avatar">
              ${(post.user?.username?.charAt(0) || "U").toUpperCase()}
            </div>

            <h3>${post.user?.username || "User"}</h3>
          </div>

          <p>${post.content || ""}</p>

          ${post.image ? `
            <img src="http://localhost:5000/uploads/${post.image}">
          ` : ""}

          <button onclick="likePost('${post._id}')">
            ❤️ ${post.likes?.length || 0}
          </button>

          <div class="comments">
            ${commentsHTML}

            <div class="comment-box">
              <input id="comment-${post._id}" placeholder="Write comment...">
              <button onclick="addComment('${post._id}')">➤</button>
            </div>
          </div>

        </div>
      `;
    });

  } catch (err) {
    console.log("ERROR:", err);
  }
}

// ==========================
// ❤️ LIKE POST
// ==========================
async function likePost(id) {
  try {
    const res = await fetch(`${API}/posts/like/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + getToken()
      }
    });

    if (!res.ok) {
      return alert("Like failed");
    }

    loadPosts();

  } catch (err) {
    console.log(err);
  }
}

// ==========================
// 💬 ADD COMMENT
// ==========================
async function addComment(postId) {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text) return alert("Write something");

  try {
    const res = await fetch(`${API}/posts/comment/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken()
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      return alert("Comment failed");
    }

    input.value = "";
    loadPosts();

  } catch (err) {
    console.log(err);
  }
}

// ==========================
// 🚪 LOGOUT
// ==========================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// ==========================
// 📂 UI HELPERS
// ==========================
function toggleMenu() {
  const menu = document.getElementById("dropdown");
  if (!menu) return;

  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}

function showFileName() {
  const file = document.getElementById("file").files[0];
  const fileName = document.getElementById("fileName");

  if (!fileName) return;

  fileName.innerText = file ? file.name : "";
}

// ==========================
// 🚀 INIT
// ==========================
loadPosts();