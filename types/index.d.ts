import type { Plugin as VitePlugin } from 'vite'

export type ViteReactNativeWebOptions = {
	enableExpoManualChunk?: boolean
}

export default function reactNativeWeb(options?: ViteReactNativeWebOptions): VitePlugin
