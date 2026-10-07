import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import reactNativeWeb from 'vite-plugin-react-native-web'

export default defineConfig({
	plugins: [reactNativeWeb(), react()],
	environments: {
		client: {
			build: { outDir: 'dist/client' },
		},
		ssr: {
			build: {
				outDir: 'dist/server',
				rolldownOptions: { input: 'src/entry-server.tsx' },
			},
		},
	},
	builder: {},
})
