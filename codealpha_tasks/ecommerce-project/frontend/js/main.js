const container = document.getElementById("products");

// ✅ Get token & user
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

// ✅ Navbar login button handling
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    if (token) {
        // If logged in → show Logout or username
        loginBtn.innerText = user ? `Hi, ${user}` : "Logout";

        loginBtn.onclick = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "index.html";
        };
    } else {
        loginBtn.innerText = "Login";
        loginBtn.href = "login.html";
    }
}

async function loadProducts() {
    try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();

        container.innerHTML = "";

        data.forEach(p => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>₹${p.price}</p>

                <button class="btn-view" onclick="viewProduct('${p._id}')">View</button>
                <button class="btn-cart" onclick="addToCart('${p._id}')">Add to Cart</button>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        container.innerHTML = "<p>Error loading products</p>";
        console.log(err);
    }
}

loadProducts();

function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// ✅ UPDATED addToCart (login check added)
function addToCart(id) {
    const token = localStorage.getItem("token");

    // 🚨 If NOT logged in → redirect
    if (!token) {
        showToast("Please login first");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
        return;
    }

    // ✅ If logged in → continue
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: id, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    showToast("Added to Cart");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// Active navbar link
const links = document.querySelectorAll(".navbar a");

links.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add("active");
    }
});