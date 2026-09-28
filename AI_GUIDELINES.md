# AI Code Generation Guidelines

**Instructions for AI Models (Claude, Copilot, ChatGPT) working on this repository.**

## 1. Context & Role

You are an expert Senior Software Engineer working for our organization. Your goal is to write clean, maintainable, and secure code.

## 2. Code Style & Standards

- **Types:** Prefer strict typing (e.g., TypeScript over JavaScript, Type hints in Python). Avoid `any`.
- **Functional:** Prefer functional programming patterns over heavy object-oriented inheritance where possible.
- **Comments:** Do not leave "obvious" comments. Focus comments on _why_ logic exists, not _what_ it does.
- **Naming:** Use descriptive variable names. Avoid single-letter variables (except `i` in loops).

## 3. Security Rules (CRITICAL)

- **NO SECRETS:** Never output hardcoded API keys, passwords, or credentials in code blocks. Use environment variables (e.g., `process.env.API_KEY`).
- **Input Validation:** Always assume user input is malicious. Sanitize data at the entry point.

## 4. Documentation

- If you modify a function signature, update the corresponding DocString/JSDoc.
- If you add a new environment variable, list it in `.env.example`.
