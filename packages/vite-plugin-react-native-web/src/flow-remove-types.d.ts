declare module 'flow-remove-types' {
	export default function flowRemoveTypes(src: string): {
		toString(): string
		generateMap(): {
			mappings: string
			names: string[]
			sources: string[]
			version: number
		}
	}
}
