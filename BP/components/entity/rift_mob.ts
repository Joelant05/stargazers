export default defineComponent(({ name, template, schema }) => {
	name('star:is_rift_mob')
	schema({
		type: 'object',
		additonalProperties: false,
		description: 'Defines this entity as an entity spawned from a rift.',
		properties: {
			spawn_event_ext: {
				type: 'object',
				description: 'Event responses to sequence after adding rift tracker.'
			}
		}
	})

	template(({ spawn_event_ext }, { create }) => {
		create({
			"star:rift_spawned": {
				sequence: [
					{
						add: {
							component_groups: ["star:rift_tracker"]
						}
					},
					spawn_event_ext
				]
			},
			'star:rift_mob_death': {}
		}, 'minecraft:entity/events')

		create({
			'star:rift_tracker': {
				"minecraft:on_death": {
					"target": "self",
					"event": "star:rift_mob_death"
				},
				"minecraft:type_family": {
					"family": ["rift_entity"]
				},
				// Does this not work?
				"minecraft:damage_sensor": {
					"triggers": [
						{
							"deals_damage": false,
							"on_damage": {
								"filters": {
									"test": "is_family",
									"subject": "damager",
									"value": "rift_entity"
								}
							}
						}
					]
				}
			}
		}, 'minecraft:entity/component_groups')
	})
})
