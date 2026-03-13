import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rolldown'

export default defineConfig({
	input: 'src/index.ts',
	external: ['flow-remove-types', 'vite'],
	output: [
		{
			format: 'cjs',
			dir: './dist/cjs',
			exports: 'named',
			sourcemap: true,
		},
		{
			format: 'es',
			dir: './dist/es',
			sourcemap: true,
		},
	],

	plugins: [typescript()],
})
