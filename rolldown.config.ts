import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rolldown'

export default defineConfig({
	input: 'src/index.ts',
	external: ['flow-remove-types'],
	output: [
		{
			format: 'cjs',
			file: './dist/cjs/index.js',
			exports: 'named',
			footer: 'module.exports = Object.assign(exports.default, exports);',
			sourcemap: true,
		},
		{
			format: 'es',
			file: './dist/es/index.js',
			plugins: [
				{
					name: 'emit-module-package-file',
					generateBundle() {
						this.emitFile({
							type: 'asset',
							fileName: 'package.json',
							source: `{"type":"module"}`,
						})
					},
				},
			],
			sourcemap: true,
		},
	],

	plugins: [typescript()],
})