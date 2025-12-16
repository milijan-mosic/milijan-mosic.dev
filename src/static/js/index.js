import LiquidBackground from "/static/js/liquid.min.js";

const app = LiquidBackground(document.getElementById("canvas"));

app.loadImage("/static/images/background.webp");
app.liquidPlane.material.metalness = 0.75;
app.liquidPlane.material.roughness = 0.25;
app.liquidPlane.uniforms.displacementScale.value = 5;
app.setRain(true);

// ---------------------------------------------------------------- #### ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  const button = document.getElementById("submit-button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.className =
      "animate text-lg rounded-full p-2 px-4 mb-4 bg-yellow-300 text-black cursor-not-allowed";
    button.innerHTML = "Sending...";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.request.value.trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(res);
      if (!res.ok) throw new Error("Failed to send request");

      status.textContent = "Request sent successfully!";
      status.className =
        "text-green-500 text-xl mt-4 rounded-full p-4 px-6 md:px-8 bg-black/50 text-center mb-8";

      form.reset();
    } catch (err) {
      status.textContent = "Something went wrong. Try again later.";
      status.className =
        "text-red-500 text-xl mt-4 rounded-full p-4 px-6 md:px-8 bg-black/50 text-center mb-8";
    }

    button.disabled = false;
    button.className =
      "animate text-lg rounded-full p-2 px-4 mb-4 bg-sky-800 border-1 border-sky-500 hover:border-white hover:bg-white hover:text-black hover:cursor-pointer";
    button.innerHTML = "Send Request";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const menuIcon = document.getElementById("menuIcon");
  const mobileMenu = document.getElementById("mobileMenu");

  let isOpen = false;

  function toggleNavbarVisibility() {
    if (window.scrollY > 900) {
      navbar.classList.remove("opacity-0");
      navbar.classList.add("opacity-100");
    } else {
      navbar.classList.add("opacity-0");
      navbar.classList.remove("opacity-100");
      isOpen = false;
      mobileMenu.style.maxHeight = "0px";
      menuIcon.textContent = "☰";
    }
  }

  window.addEventListener("scroll", toggleNavbarVisibility);

  menuToggle.addEventListener("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      mobileMenu.style.maxHeight = "500px";
      menuIcon.textContent = "✕";
    } else {
      mobileMenu.style.maxHeight = "0px";
      menuIcon.textContent = "☰";
    }
  });

  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      isOpen = false;
      mobileMenu.style.maxHeight = "0px";
      menuIcon.textContent = "☰";
    });
  });
});
