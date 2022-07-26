import { Player, world } from "mojang-minecraft"

const events = ['rift', 'positiveEffects', 'negativeEffects'] as const

export default class RandomEvent {
    public event: typeof events[number]

    constructor() {
        world.events.dataDrivenEntityTriggerEvent.subscribe((event) => {
            if (event.id === 'star:on_star_interact_player') {
                this.chooseEvent()
                this.run(event.entity as Player)
            }
        })
    }

    chooseEvent() {
        const index = Math.floor(Math.random() * (events.length - 0.01))
        this.event = events[index]
    }

    run(player: Player) {
        console.warn(this.event)
        switch (this.event) {
            case 'positiveEffects': {

            }
            case 'negativeEffects': {

            }
            case 'rift': {

            }
        }
    }
}