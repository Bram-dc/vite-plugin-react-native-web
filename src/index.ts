import fs from 'node:fs/promises'
import flowRemoveTypes from 'flow-remove-types'
import { transformWithEsbuild } from 'vite'

import type { Plugin as ESBuildPlugin } from 'esbuild'
import type { SourceMap } from 'rollup'
import type { Plugin as VitePlugin } from 'vite'
// import type { ViteReactNativeWebOptions } from '../types'

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

const nativeLegacyScriptPathPattern = /\.(js|flow)$/

const flowPragmaPattern = /@flow\b/
const useClientPragmaPattern = /['"]use client['"]/

const jsxElementPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/
const jsxSelfClosingPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*\/?>/
const jsxFragmentPattern = /<>([\s\S]*?)<\/>/

const loaders = {
	'.js': 'jsx',
	'.flow': 'jsx',
} as const

const getLoader = (path: string) => {
	const ext = `.${path.split('.').pop()}`

	if (ext in loaders) {
		return loaders[ext as keyof typeof loaders]
	}

	return 'default' as const
}

const esbuildPlugin = (): ESBuildPlugin => ({
	name: 'react-native-web',
	setup: (build) => {
		build.onLoad({ filter: nativeLegacyScriptPathPattern }, async (args) => {
			let contents = await fs.readFile(args.path, 'utf-8')

			if (nativeLegacyScriptPathPattern.test(args.path) && flowPragmaPattern.test(contents)) {
				const transformed = flowRemoveTypes(contents)
				contents = transformed.toString()
			}

			const loader = getLoader(args.path)

			return {
				contents,
				loader,
			}
		})
	},
})

const reactNativeWeb = (/*options: ViteReactNativeWebOptions = {}*/): VitePlugin => ({
	enforce: 'pre',
	name: 'react-native-web',

	config: () => ({
		define: {
			global: 'self',
			__DEV__: JSON.stringify(development),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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

		if (!nativeLegacyScriptPathPattern.test(id)) {
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
			const loader = getLoader(id)

			const result = await transformWithEsbuild(code, id, {
				loader,
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
