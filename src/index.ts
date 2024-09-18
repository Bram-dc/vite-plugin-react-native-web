import { transformWithEsbuild } from 'vite'
import flowRemoveTypes from 'flow-remove-types'
import fs from 'fs/promises'

import type { Plugin as VitePlugin } from 'vite'
import type { Plugin as ESBuildPlugin } from 'esbuild'
// import type { ViteReactNativeWebOptions } from '../types'

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

const loader = {
    '.js': 'jsx',
} as const

const filter = /\.(js|flow)$/

const esbuildPlugin = (): ESBuildPlugin => ({
    name: 'react-native-web',
    setup: build => {
        build.onLoad({ filter }, async ({ path }) => {
            const src = await fs.readFile(path, 'utf-8')
            return {
                contents: flowRemoveTypes(src).toString(),
                loader: loader['.js'],
            }
        })
    },
})

const reactNativeWeb = (/*options: ViteReactNativeWebOptions = {}*/): VitePlugin => ({
    enforce: 'pre',
    name: 'react-native-web',

    config: () => ({
        define: {
            global: 'window',
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

    transform(code, id) {
        if (!filter.test(id)) {
            return
        }

        // Skip files that are using 'use client' pragma since these break esbuild mappings (https://github.com/vitejs/vite/issues/15012)
        if (code.includes('\'use client\'') || code.includes('"use client"')) {
            return
        }

        if (code.includes('@flow')) {
            code = flowRemoveTypes(code).toString()
        }

        return transformWithEsbuild(code, id, {
            loader: loader['.js'],
            tsconfigRaw: {
                compilerOptions: {
                    jsx: 'react-jsx',
                },
            },
        })
    },
})

export default reactNativeWeb