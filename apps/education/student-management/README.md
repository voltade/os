# App Template

This repository should be used as a starter template for developing apps on
voltade-os. It includes developer configurations necessary for developing Bun
worker compliant applications.

## Getting Started

1. Set up dependencies for the project

```bash
bun install
cp .env.example .env
```

Insert the relevant environment variables into the `.env` file.

2. Start development

```bash
bun run dev
```

## Building for Production

To run for production:

```bash
bun start
```

## Styling

TBD

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The
following scripts are available:

```bash
bun run lint
bun run format
bun run check
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial
setup is a file based router. Which means that the routes are managed as files
in `src/routes`.
