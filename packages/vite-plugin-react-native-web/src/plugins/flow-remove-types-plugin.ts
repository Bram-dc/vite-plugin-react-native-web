import flowRemoveTypes from 'flow-remove-types'
import type { RolldownPlugin } from 'rolldown'

export const flowRemoveTypesPlugin = (): RolldownPlugin => ({
	name: 'flow-remove-types',
	transform: {
		filter: {
			code: /@flow/,
		},
		handler: async (code) => {
			const transformed = flowRemoveTypes(code)
			code = transformed.toString()

			return code
		},
	},
})
