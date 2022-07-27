import { Player, world, Location, Entity } from "mojang-minecraft"

export class Rift {
    protected entity: Entity

    constructor(position: Location) {
        this.summon(position)
    }

    summon(position: Location) {
        const ow = world.getDimension('overworld')
        this.entity = ow.spawnEntity('star:rift', position)
    }

    start() {
        console.warn('start')
        const ow = world.getDimension('overworld')
        ow.spawnEntity('minecraft:lightning_bolt', this.entity.location)
    }
}