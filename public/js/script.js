let allMenuItems = [];


function renderMenu(items) {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return;

  menuGrid.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.price} rs</p>
      <button class="add-to-cart"
        data-name="${item.name}"
        data-price="${item.price}">
        Add to Cart
      </button>
    `;

    menuGrid.appendChild(div);
  });
}

/* ======================================================
   SEARCH & FILTER
====================================================== */
function setupSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterCategory");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();
      const filtered = allMenuItems.filter(item =>
        item.name.toLowerCase().includes(value)
      );
      renderMenu(filtered);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const cat = filterSelect.value;
      const filtered =
        cat === "all"
          ? allMenuItems
          : allMenuItems.filter(i => i.category === cat);
      renderMenu(filtered);
    });
  }
}


/* ======================================================
   CART LOGIC
====================================================== */
let cart = [];

function setupCart() {

  const menuGrid = document.getElementById("menuGrid");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!menuGrid) return;

  menuGrid.addEventListener("click", e => {
    if (e.target.classList.contains("add-to-cart")) {
      cart.push({
        name: e.target.dataset.name,
        price: Number(e.target.dataset.price)
      });
      updateCartUI();
    }
  });

  function updateCartUI() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      const p = document.createElement("p");
      p.innerHTML = `
        ${item.name} - ${item.price} rs
        <button data-index="${index}">Remove</button>
      `;
      cartItems.appendChild(p);
    });

    cartTotal.textContent = total;
  }

  cartItems.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      cart.splice(e.target.dataset.index, 1);
      updateCartUI();
    }
  });

  // ✅ ONLY ONE checkout listener
  checkoutBtn?.addEventListener("click", placeOrder);
}


/* ======================================================
   LOGIN FORM (BACKEND READY)
====================================================== */
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        alert("Login success");
        window.location.href = "/";
      } else {
        alert("Invalid credentials");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Server error");
    }
  });
}

//SignUp Backend ready
function setupSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("signupStatus").textContent =
      result.message;

    if (result.success) form.reset();
  });
}


/*Contact Form */

function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      document.getElementById("contactStatus").textContent =
        result.message;

      form.reset();

    } catch (err) {
      console.error(err);
      alert("Error sending message");
    }
  });
}

//place order function

async function placeOrder() {

  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cart,
      total: total
    })
  });

  const data = await res.json();

  alert(data.message);

  if (data.success) {
    cart = [];
    location.reload();
  }
}


/* ======================================================
   THEME & DARK MODE
====================================================== */
function setupTheme() {
  const darkBtn = document.getElementById("darkModeToggle");
  const themeBtn = document.getElementById("themeToggleBtn");

  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("alt-theme");
    });
  }
}

/* ======================================================
   ANIMATIONS & PARTICLES
====================================================== */
function setupAnimations() {
  if (window.AOS) {
    AOS.init({ duration: 800, easing: "slide" });
  }

  if (window.particlesJS) {
    particlesJS("particles-js", {
      particles: {
        number: { value: 60 },
        color: { value: "#ffffff" },
        size: { value: 3 },
        move: { speed: 3 }
      }
    });
  }
}

async function loadMenuFromAPI() {
  try {
    const res = await fetch("/api/menu");
    const data = await res.json();
    allMenuItems = data;       // ⭐ store globally
    renderMenu(allMenuItems);
  } catch (err) {
    console.error("Menu load failed:", err);
  }
}


/* ======================================================
   INIT
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadMenuFromAPI();
  setupSearchAndFilter();
  setupCart();
  setupLoginForm();
  setupSignupForm();
  setupContactForm();   // ⭐ added
  setupTheme();
  setupAnimations();
});



