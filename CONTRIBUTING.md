# Contributing

Thanks for your interest in contributing to GotIt!

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies with `bun install`.
3. Configure the environment variables described in the [README](./README.md#authentication).
4. Start the development server with `bun dev`.

## Making changes

- Create a focused branch for your change.
- Keep changes scoped and follow the existing code style and patterns.
- Do not commit credentials, secrets, or local environment files.
- Add or update tests when appropriate. Before opening a pull request, run:

  ```bash
  bun run lint
  bun run build
  ```

## Pull requests

- Describe the problem and the changes in your pull request.
- Include steps to verify behavior and screenshots for user-facing changes when helpful.
- Make sure your branch is up to date with the default branch and resolve any review feedback.

For bugs or feature ideas, open an issue with enough detail for others to reproduce or understand the request.
