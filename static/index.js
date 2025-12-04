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
  const button = document.getElementById("submit-button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.className =
      "transition-all duration-75 ease-linear text-lg rounded-full p-2 px-4 mb-4 bg-yellow-300 text-black cursor-not-allowed";
    button.innerHTML = "Sending...";

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

      status.textContent = "Request sent successfully!";
      status.className =
        "text-green-500 text-xl mt-4 rounded-full p-4 bg-black/50 text-center";

      form.reset();
    } catch (err) {
      status.textContent = "Something went wrong. Try again later.";
      status.className =
        "text-red-500 text-xl mt-4 rounded-full p-4 bg-black/50 text-center";
    }

    button.disabled = false;
    button.className =
      "transition-all duration-75 ease-linear text-lg rounded-full p-2 px-4 mb-4 bg-sky-500 hover:bg-white hover:text-black hover:cursor-pointer";
    button.innerHTML = "Send Request";
  });
});
