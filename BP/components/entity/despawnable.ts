export default defineComponent(({ name, template, schema }) => {
	name('utils:despawnable')
	schema({
		additionalProperties: false,
		type: 'object',
		description: 'Adds an event "utils:despawn" to despawn entity instantly.'
	})

	template(({ }, { create }) => {
		create({
			'utils:despawn': {
				add: {
					component_groups: ['utils:instant_despawn']
				}
			}
		}, 'minecraft:entity/events')
		create({
			'utils:instant_despawn': {
				'minecraft:instant_despawn': {}
			}
		}, 'minecraft:entity/component_groups')
	})
})
