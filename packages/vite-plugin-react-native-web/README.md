# vite-plugin-react-native-web

React Native Web support for Vite.

## Peer Dependencies

This plugin requires `react-native-web` and `inline-style-prefixer` as peer dependencies. **You must install them in the `node_modules` directory of the app where you use this plugin.**

> **Note:** If you are using pnpm or a workspace setup, peer dependencies may be installed in nested `node_modules` folders by default. To avoid issues, ensure both `react-native-web` and `inline-style-prefixer` are installed in the app's own `node_modules` directory:

```sh
pnpm add react-native-web inline-style-prefixer
```

## Why?

- `react-native-web` provides the core React Native compatibility for web.
- `inline-style-prefixer` is required for style prefixing and is used internally by `react-native-web`.

## Example Vite config

To ensure correct dependency optimization, add the following to your Vite config:

```js
optimizeDeps: {
  include: [
    'inline-style-prefixer/lib/createPrefixer',
    'inline-style-prefixer/lib/plugins/backgroundClip',
    'inline-style-prefixer/lib/plugins/crossFade',
    'inline-style-prefixer/lib/plugins/cursor',
    'inline-style-prefixer/lib/plugins/filter',
    'inline-style-prefixer/lib/plugins/imageSet',
    'inline-style-prefixer/lib/plugins/logical',
    'inline-style-prefixer/lib/plugins/position',
    'inline-style-prefixer/lib/plugins/sizing',
    'inline-style-prefixer/lib/plugins/transition'
  ]
}
```

## License

MIT
