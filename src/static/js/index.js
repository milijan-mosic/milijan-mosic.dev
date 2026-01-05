// import LiquidBackground from "/static/js/liquid.min.js";

// const app = LiquidBackground(document.getElementById("canvas"));

// app.loadImage("/static/images/background.webp");
// app.liquidPlane.material.metalness = 0.75;
// app.liquidPlane.material.roughness = 0.25;
// app.liquidPlane.uniforms.displacementScale.value = 5;
// app.setRain(true);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  const button = document.getElementById("submit-button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.className =
      "p-2 px-8 mb-4 text-lg text-black bg-yellow-300 rounded-full cursor-not-allowed animate";
    button.innerHTML = "Sending...";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.request.value.trim(),
      from_site: "Moss",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send request");

      status.textContent = "Request sent successfully!";
      status.className =
        "p-4 px-8 mt-4 mb-8 text-xl text-center text-green-500 rounded-full bg-black/50";

      form.reset();
    } catch (err) {
      status.textContent = "Something went wrong. Try again later.";
      status.className =
        "p-4 px-8 mt-4 mb-8 text-xl text-center text-red-500 rounded-full bg-black/50";
    }

    button.disabled = false;
    button.className =
      "p-2 px-8 mb-4 text-lg bg-sky-800 rounded-full border-sky-500 animate border-1 hover:border-white hover:bg-white hover:text-black hover:cursor-pointer";
    button.innerHTML = "Send request";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const menuIcon = document.getElementById("menuIcon");
  const mobileMenu = document.getElementById("mobileMenu");

  let isOpen = false;
  const menuClosedIcon = "/static/icons/bars.svg";
  const menuOpenIcon = "/static/icons/xmark.svg";

  function toggleNavbarVisibility() {
    if (window.scrollY > 900) {
      navbar.classList.remove("opacity-0");
      navbar.classList.add("opacity-100");
    } else {
      navbar.classList.add("opacity-0");
      navbar.classList.remove("opacity-100");
      isOpen = false;
      mobileMenu.style.maxHeight = "0px";
      menuIcon.src = menuClosedIcon;
    }
  }

  window.addEventListener("scroll", toggleNavbarVisibility);

  menuToggle.addEventListener("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      mobileMenu.style.maxHeight = "500px";
      menuIcon.src = menuOpenIcon;
    } else {
      mobileMenu.style.maxHeight = "0px";
      menuIcon.src = menuClosedIcon;
    }
  });

  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      isOpen = false;
      mobileMenu.style.maxHeight = "0px";
      menuIcon.src = menuClosedIcon;
    });
  });
});
