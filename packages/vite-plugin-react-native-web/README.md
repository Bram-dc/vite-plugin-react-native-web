# vite-plugin-react-native-web

React Native Web support for Vite.

## Peer Dependencies

This plugin requires `react-native-web` and `inline-style-prefixer` as peer dependencies. **You must install them in the `node_modules` directory of the app where you use this plugin.**

> **Note:** If you are using pnpm or a workspace setup, peer dependencies may be installed in nested `node_modules` folders by default. To avoid issues, ensure both `react-native-web` and `inline-style-prefixer` are installed in the app's own `node_modules` directory:

```sh
pnpm add react-native-web inline-style-prefixer
```

## License

MIT
