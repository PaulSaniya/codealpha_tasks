const API = "http://localhost:5000/api";

/* =========================
   AUTH HELPERS
========================= */
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    return null;
  }
}

/* =========================
   AUTO REDIRECT (LOGIN PAGE)
========================= */
if (window.location.pathname.includes("login.html")) {
  if (getToken()) {
    window.location.href = "index.html";
  }
}

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const msg = document.getElementById("msg");
  const btn = document.querySelector("button");

  try {
    btn.disabled = true;
    btn.innerText = "Logging in...";

    const res = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    if (!res.ok) {
      msg.innerText = data.msg || "Login failed";
      msg.style.color = "red";
      return;
    }

    if (!data.token || !data.user) {
      msg.innerText = "Invalid server response";
      msg.style.color = "red";
      return;
    }

    // ✅ SAFE STORAGE
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      id: data.user.id,
      username: data.user.username
    }));

    msg.innerText = "Login successful!";
    msg.style.color = "green";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);

  } catch (err) {
    console.error(err);
    msg.innerText = "Server error. Try again later.";
    msg.style.color = "red";

  } finally {
    btn.disabled = false;
    btn.innerText = "Login";
  }
}

/* =========================
   REGISTER
========================= */
async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const msg = document.getElementById("msg");
  const btn = document.querySelector("button");

  try {
    btn.disabled = true;
    btn.innerText = "Registering...";

    const res = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    console.log("REGISTER RESPONSE:", data);

    if (!res.ok) {
      msg.innerText = data.msg || "Registration failed";
      msg.style.color = "red";
      return;
    }

    msg.innerText = "Registered successfully! Redirecting...";
    msg.style.color = "green";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    msg.innerText = "Server error";
    msg.style.color = "red";

  } finally {
    btn.disabled = false;
    btn.innerText = "Register";
  }
}