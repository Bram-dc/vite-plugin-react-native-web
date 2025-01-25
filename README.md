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
  plugins: [
    reactNativeWeb()
  ]
});
```

If you are getting errors please report them in the issues section.

The following variables are defined in the transformed files: (inferred during Vite's build process)
- `global` as `self`
- `__DEV__` as `process.env.NODE_ENV === 'development'`
- `process.env.NODE_ENV` as `process.env.NODE_ENV`

## Contributing
Please feel free to contribute to this project. Just fork it and submit a PR.

## License
MIT
