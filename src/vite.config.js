export default {
  build: {
    outDir: "./static/js/dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        shader: "./static/js/shader.js",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
};
