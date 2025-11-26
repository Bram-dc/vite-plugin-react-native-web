import fs from 'node:fs/promises'
import type { Plugin as ESBuildPlugin } from 'esbuild'
import flowRemoveTypes from 'flow-remove-types'
import type { SourceMap } from 'rollup'
import type { Plugin as VitePlugin } from 'vite'
import { transformWithEsbuild } from 'vite'

import type { ViteReactNativeWebOptions } from '../types'

const development = process.env.NODE_ENV === 'development'

const extensions = [
	// ⚠️ This currently does not work as expected (https://github.com/evanw/esbuild/issues/4053)
	// '.web.mjs',
	// '.mjs',
	// '.web.js',
	// '.js',
	// '.web.mts',
	// '.mts',
	// '.web.ts',
	// '.ts',
	// '.web.jsx',
	// '.jsx',
	// '.web.tsx',
	// '.tsx',
	// '.json',

	// ⚠️ Temporary fix
	'.web.mjs',
	'.web.js',
	'.web.mts',
	'.web.ts',
	'.web.jsx',
	'.web.tsx',
	'.mjs',
	'.js',
	'.mts',
	'.ts',
	'.jsx',
	'.tsx',
	'.json',
]

const reactNativeFlowJsxPathPattern = /\.(js|flow)$/
const reactNativeFlowJsxLoader = 'jsx'

const flowPragmaPattern = /@flow\b/
const useClientPragmaPattern = /['"]use client['"]/

const jsxElementPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/
const jsxSelfClosingPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*\/?>/
const jsxFragmentPattern = /<>([\s\S]*?)<\/>/

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
			global: 'self',
			__DEV__: JSON.stringify(development),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.EXPO_OS': JSON.stringify('web'),
		},
		build: {
			commonjsOptions: {
				extensions,
				transformMixedEsModules: true,
			},
			rollupOptions:
				options?.enableExpoManualChunk !== false
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

		if (flowPragmaPattern.test(code)) {
			const transformed = flowRemoveTypes(code)
			code = transformed.toString()
			map = {
				file: id,
				toUrl: () => id,
				...transformed.generateMap(),
			}
		}

		if (jsxElementPattern.test(code) || jsxSelfClosingPattern.test(code) || jsxFragmentPattern.test(code)) {
			const result = await transformWithEsbuild(code, id, {
				loader: reactNativeFlowJsxLoader,
				tsconfigRaw: {
					compilerOptions: {
						jsx: 'react-jsx',
					},
				},
			})

			code = result.code
			map = result.map

			// Do not include source maps for files that are using 'use client' pragma since these break the esbuild mappings (https://github.com/vitejs/vite/issues/15012)
			if (useClientPragmaPattern.test(code)) {
				map = null
			}
		}

		return { code, map }
	},
})

export default reactNativeWeb
