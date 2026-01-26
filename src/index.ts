import fs from 'node:fs/promises'
import type { Plugin as ESBuildPlugin } from 'esbuild'
import flowRemoveTypes from 'flow-remove-types'
import type { SourceMap } from 'rollup'
import type { Plugin as VitePlugin } from 'vite'
import { transformWithEsbuild } from 'vite'

import type { ViteReactNativeWebOptions } from '../types'

const development = process.env.NODE_ENV === 'development'

const extensions = [
	'.web.mjs',
	'.mjs',
	'.web.js',
	'.js',
	'.web.mts',
	'.mts',
	'.web.ts',
	'.ts',
	'.web.jsx',
	'.jsx',
	'.web.tsx',
	'.tsx',
	'.json',
]

const reactNativeFlowJsxPathPattern = /\.(js|flow)$/
const reactNativeFlowJsxLoader = 'jsx'

const flowPragmaPattern = /@flow\b/

const esbuildPlugin = (): ESBuildPlugin => ({
	name: 'react-native-web',
	setup: (build) => {
		build.onLoad({ filter: reactNativeFlowJsxPathPattern }, async (args) => {
			let contents = await fs.readFile(args.path, 'utf-8')

			if (flowPragmaPattern.test(contents)) {
				const transformed = flowRemoveTypes(contents)
				contents = transformed.toString()
			}

			return {
				contents,
				loader: reactNativeFlowJsxLoader,
			}
		})
	},
})

const reactNativeWeb = (options?: ViteReactNativeWebOptions): VitePlugin => ({
	enforce: 'pre',
	name: 'react-native-web',

	config: () => ({
		define: {
			global: 'globalThis',
			__DEV__: JSON.stringify(development),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.EXPO_OS': JSON.stringify('web'),
		},
		build: {
			commonjsOptions: {
				extensions,
				transformMixedEsModules: true,
			},
			rollupOptions: options?.enableExpoManualChunk
				? {
						output: {
							manualChunks(id) {
								if (id.includes('expo-modules-core')) {
									return 'expo-modules-core'
								}
							},

							entryFileNames: (chunk) => {
								if (chunk.name === 'expo-modules-core') {
									return '0-expo-modules-core.js'
								}
								return '[name].js'
							},
						},
					}
				: undefined,
		},
		resolve: {
			extensions,
			alias: [{ find: 'react-native', replacement: 'react-native-web' }],
		},
		optimizeDeps: {
			esbuildOptions: {
				plugins: [esbuildPlugin()],
				resolveExtensions: extensions,
			},
		},
	}),

	async transform(code, id) {
		id = id.split('?')[0]

		if (!reactNativeFlowJsxPathPattern.test(id)) {
			return
		}

		let map: SourceMap | null = null

		const transformed = flowRemoveTypes(code)
		code = transformed.toString()
		map = {
			file: id,
			toUrl: () => id,
			...transformed.generateMap(),
		}

		const result = await transformWithEsbuild(code, id, {
			loader: reactNativeFlowJsxLoader,
			jsx: 'automatic',
		})
		code = result.code
		map = result.map

		return { code, map }
	},
})

export default reactNativeWeb
