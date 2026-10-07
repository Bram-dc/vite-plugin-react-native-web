# vite-plugin-react-native-web

[![npm](https://img.shields.io/npm/v/vite-plugin-react-native-web?style=flat-square)](https://www.npmjs.com/package/vite-plugin-react-native-web)

Add React Native Web support to Vite by removing Flow types, aliasing `react-native` to `react-native-web` and transforming .js files as .jsx files using ESBuild.

## Installation

Just install it:

```bash
npm i vite-plugin-react-native-web -D
```

## Usage

```typescript
import reactNativeWeb from "vite-plugin-react-native-web";

export default defineConfig({
  plugins: [reactNativeWeb({ ... })],
});
```

If you are getting errors please report them in the issues section.

The following variables are defined in the transformed files: (inferred during Vite's build process)

- `global` as `globalThis`
- `__DEV__` as `process.env.NODE_ENV === 'development'`
- `process.env.NODE_ENV` as `process.env.NODE_ENV`
- `process.env.EXPO_OS` as `"web"`

## Peer Dependencies

This plugin requires `react-native-web` as a peer dependency. **You must install it in the `node_modules` directory of the app where you use this plugin.**

> **Note:** If you are using pnpm or a workspace setup, peer dependencies may be installed in nested `node_modules` folders by default. To avoid issues, ensure `react-native-web` is installed in the app's own `node_modules` directory:

```sh
pnpm add react-native-web
```

The plugin resolves `inline-style-prefixer` through `react-native-web`, so it no longer has to be installed in the app.

## Server-side rendering

The plugin also configures every environment that runs on the server, such as Vite's `ssr` environment:

- `react-native-web` and every dependency that depends on `react-native` or `react-native-web` are bundled instead of being loaded by Node.js. Their `react-native` imports are aliased and compiled like in the browser. The dependencies are found by crawling your `package.json`.
- In development, JSX and Flow in those dependencies are compiled, and the CommonJS helpers of `react-native-web` are pre-bundled, so Vite's module runner can execute them.

Render through `AppRegistry` on both sides, so the server produces the same wrapper the browser hydrates:

```tsx
// server
AppRegistry.registerComponent('App', () => App)
const { element, getStyleElement } = AppRegistry.getApplication('App')
const html = renderToString(element)
const css = renderToStaticMarkup(getStyleElement())

// browser
AppRegistry.registerComponent('App', () => App)
AppRegistry.runApplication('App', { rootTag: document.getElementById('root'), hydrate: true })
```

The [SSR example](./apps/ssr-example) shows a complete setup with React Navigation, a development server with HMR and a production server.

Dependencies that mix CommonJS files into an ES module package, such as `@expo/vector-icons`, cannot run in Vite's development module runner. They work in `vite build`. To bundle the server build completely, for example for a container without `node_modules`, set `environments.ssr.resolve.noExternal` to `true` for `vite build`.

## Examples

- [React + TypeScript + Vite + React Native Web Example](./apps/example)
- [React + TypeScript + Expo + Vite + React Native Web Example](./apps/expo-example)
- [React + TypeScript + Vite + React Native Web SSR Example](./apps/ssr-example)

## Contributing

Please feel free to contribute to this project. Just fork it and submit a PR.

## License

MIT
