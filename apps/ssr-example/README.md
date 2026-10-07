# React + TypeScript + Vite + React Native Web SSR Example

Server-side rendering with React Native Web and React Navigation. Every URL is rendered to HTML on the server with React Native Web's styles inlined, and the browser hydrates it. Rendering works in development, with HMR, and in a production build.

## Scripts

- `pnpm dev` starts the development server on http://localhost:5173.
- `pnpm build` builds the client to `dist/client` and the renderer to `dist/server`.
- `pnpm preview` serves the build on http://localhost:4173.

`server.ts` runs as is on Node.js 22.18+ or Bun.

## How it works

- `vite.config.ts` declares a `client` and an `ssr` environment, and `vite build` builds both. The plugin bundles `react-native-web` and every dependency that uses `react-native` into the server environment, so the example needs no `noExternal` configuration.
- `src/entry-server.tsx` renders the app with `AppRegistry.getApplication` inside React Navigation's `ServerContainer`. That is the same wrapper `AppRegistry.runApplication` renders in the browser, so the markup matches. `getStyleElement()` returns the `<style id="react-native-stylesheet">` element that React Native Web reuses in the browser, and the focused screen's title becomes the page title.
- `src/entry-client.tsx` hydrates with `AppRegistry.runApplication(..., { hydrate: true })`.
- `server.ts` is a plain `node:http` server. In development it runs Vite in middleware mode and loads the renderer through the `ssr` environment's module runner. In production it serves `dist/client` and imports `dist/server/entry-server.js`.

## Hydration pitfalls

The browser has to render exactly what the server sent, otherwise React discards the markup.

- Never read `window` or `Dimensions` during render. The server has no window. The native-stack header sizes its title from the window, which is why this example hides it.
- Text that depends on the time zone or locale has to come out the same on both sides.

## Limitations

Packages that mix CommonJS files into an ES module package, such as `@expo/vector-icons`, cannot run in Vite's development module runner. They work in `vite build`.
