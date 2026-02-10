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

### Usage with Expo

This plugin should work with Expo. Sometimes the problem occurs that `expo-modules-core` is not properly chunked, which can lead to the Expo global not being injected first. A workaround for this is to enable the `enableExpoManualChunk` option, which will create a separate chunk for `expo-modules-core` and cause the Expo global to be injected correctly. This option overrides user-defined manual chunks in the Vite configuration. If you would like to use your own manual chunk configuration, you can set `enableExpoManualChunk` to false and add the following chunk configuration to your Vite config:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('expo-modules-core')) {
            return 'expo-modules-core'
          }

          // Add your other manual chunk configurations here
          // ...
        },

        entryFileNames: (chunk) => {
          if (chunk.name === 'expo-modules-core') {
            return '0-expo-modules-core.js'
          }

          // Add your other entry file name configurations here
          // ...

          return '[name].js'
        },
      },
    },
  },
});

## Options

The plugin accepts an options object with the following optional properties:

- `enableExpoManualChunk` (boolean): When set to true, this option enables manual chunking for expo-modules-core modules to optimize bundle size and loading performance. Default is false. Be cautious when enabling this option, since it overrides user-defined manual chunks in the Vite configuration.

If you are getting errors please report them in the issues section.

The following variables are defined in the transformed files: (inferred during Vite's build process)

- `global` as `globalThis`
- `__DEV__` as `process.env.NODE_ENV === 'development'`
- `process.env.NODE_ENV` as `process.env.NODE_ENV`
- `process.env.EXPO_OS` as `"web"`

## Contributing

Please feel free to contribute to this project. Just fork it and submit a PR.

## License

MIT

```

```

```
