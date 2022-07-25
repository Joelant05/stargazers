import { world, Location, Player, MinecraftItemTypes, EntityRaycastOptions, MinecraftEffectTypes, Entity } from "mojang-minecraft"
import { alert } from "scripts/Utils/alert.js"
import { giveMainhand } from "scripts/Utils/giveMainhand.js"
import { spawnInRange } from "scripts/Utils/spawnInRange.js"

export class Starfield {
    public events: {
        onStart: () => void
        onComplete: () => void
    }

    protected position: Location

    constructor(protected player: Player) {
        const controller = this.setup()
        if (!controller) return
        this.start(controller)
    }

    setup() {
        if (!giveMainhand(MinecraftItemTypes.spyglass, this.player)) return

        const ow = world.getDimension('overworld')

        this.position = new Location(this.player.location.x, 500, this.player.location.z)
        this.player.teleport(this.position, ow, 0, 0)
        return ow.spawnEntity('star:starfield_controller', this.position)
    }

    start(controller: Entity) {
        controller.runCommandAsync('ride @p start_riding @s teleport_rider').then((res) => {
            if (res.successCount > 0) {
                const ow = world.getDimension('overworld')
                ow.runCommand('time set midnight')
                alert([
                    { text: "You are now §dStargazing§r " },
                    { selector: '@s' },
                    { text: "! Using the §aSpyglass§r, find the §6Magical Star§r and zoom in on it..." }
                ], this.player)
                let progress = 0
                spawnInRange('star:star', this.position, 14, 14, 8)
                this.player.addEffect(
                    MinecraftEffectTypes.resistance,
                    4000,
                    25,
                    false
                )
                const tick = world.events.tick.subscribe((eventData) => {
                    if (eventData.currentTick % 10 === 0) {
                        // Every 0.5 seconds
                        if (progress < 12) {
                            const opts = new EntityRaycastOptions()
                            opts.maxDistance = 50
                            const entities = this.player.getEntitiesFromViewVector(opts)
                            if (entities.length > 0 && entities[0].id === 'star:star' && this.player.hasComponent('is_baby')) {
                                if (progress === 0) this.player.onScreenDisplay.setTitle('showstardisplay')
                                progress++
                            } else {
                                this.player.onScreenDisplay.setTitle('hidestardisplay')
                                progress = 0
                            }
                        } else {
                            this.events.onComplete()

                            this.player.onScreenDisplay.setTitle('hidestardisplay')
                            this.player.runCommand('clear @s spyglass 0 1')
                            this.player.runCommand('event entity @e[r=5,type=star:starfield_controller] star:on_complete')
                            this.player.triggerEvent('star:queue_starfall')

                            world.events.tick.unsubscribe(tick)
                        }

                    } else if (eventData.currentTick % 200 === 0) {
                        // Every 10 seconds
                        ow.runCommand('time set midnight')
                    }

                })
            } else {
                console.warn('Error running /ride command!')
            }
        })
    }
}