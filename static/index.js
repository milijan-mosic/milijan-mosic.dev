// import LiquidBackground from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js";

// const app = LiquidBackground(document.getElementById("canvas"));

// app.loadImage("/static/background.jpg");
// app.liquidPlane.material.metalness = 0.75;
// app.liquidPlane.material.roughness = 0.25;
// app.liquidPlane.uniforms.displacementScale.value = 5;
// app.setRain(true);

// app.liquidPlane.material.metalness = 0.0;
// app.liquidPlane.material.roughness = 0.0;
// app.liquidPlane.uniforms.displacementScale.value = 0;
// app.setRain(false);

// ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sending...";
    status.className = "text-center text-sm text-yellow-400";

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(res);
      if (!res.ok) throw new Error("Failed to send message");

      status.textContent = "Message sent successfully!";
      status.className = "text-center text-sm text-green-400";

      form.reset();
    } catch (err) {
      status.textContent = "Something went wrong. Try again later.";
      status.className = "text-center text-sm text-red-400";
    }
  });
});
