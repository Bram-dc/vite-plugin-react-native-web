import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import reactNativeWeb from 'vite-plugin-react-native-web'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		reactNativeWeb({
			enableExpoManualChunk: true,
		}),
		react(),
	],
})
