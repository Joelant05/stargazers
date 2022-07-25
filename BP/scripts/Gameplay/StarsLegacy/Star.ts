import { BlockLocation, EntityQueryOptions, MinecraftBlockTypes, TickEvent, world, BlockRaycastOptions } from "mojang-minecraft"
import { blockLocToLoc } from "scripts/Utils/location.js"

export class Star {
    protected tickEvent: (arg: TickEvent) => void
    protected locations: BlockLocation[] = []
    protected progress = 0

    constructor(protected position: BlockLocation) {
        const ow = world.getDimension('overworld')
        this.locations = position.blocksBetween(position.offset(1, 1, 1))
        for (const location of this.locations) {
            const block = ow.getBlock(location)
            block.setType(MinecraftBlockTypes.get('star:star_core'))
        }

        this.tickEvent = world.events.tick.subscribe((event) => {
            const isHalfSecond = event.currentTick % 10 === 0
            const isSecond = event.currentTick % 20 === 0
            if (isSecond) {
                // Despawn star if player is too close
                const opts = new EntityQueryOptions()
                opts.location = blockLocToLoc(this.position)
                opts.maxDistance = 32
                const playersAmount = Array.from(ow.getPlayers(opts)).length
                if (playersAmount > 0) {
                    this.clear()
                    world.events.tick.unsubscribe(this.tickEvent)
                }
                const time = ow.runCommand('time query daytime').data
                if (time >= 0 && time <= 15000) this.clear()
            } else if (isHalfSecond) {
                const players = ow.getPlayers()
                if (this.progress < 6) {
                    const opts = new BlockRaycastOptions()
                    opts.includeLiquidBlocks = false
                    for (const player of players) {
                        const block = player.getBlockFromViewVector(opts)
                        // is_baby tells us whether the player is using a spyglass
                        if (block && block.id === 'star:star_core' && player.hasComponent('is_baby')) {
                            if (this.progress === 0) player.onScreenDisplay.setTitle('showstardisplay')
                            this.progress++
                        } else {
                            player.onScreenDisplay.setTitle('hidestardisplay')
                            this.progress = 0
                        }
                    }
                } else if (this.progress >= 6) {
                    for (const player of players) player.onScreenDisplay.setTitle('hidestardisplay') // TODO SPECIAL EFFECT MAYBE?
                    this.onComplete()
                    world.events.tick.unsubscribe(this.tickEvent)
                }
            }
        })
    }

    clear() {
        const ow = world.getDimension('overworld')
        for (const location of this.locations) {
            ow.getBlock(location).setType(MinecraftBlockTypes.air)
        }
    }

    onComplete() {
        console.warn('boom')
        this.clear()
        const ow = world.getDimension('overworld')
        world.playSound('star.fall') // TODO not working
        ow.spawnEntity('star:falling_star', this.position)
    }
}