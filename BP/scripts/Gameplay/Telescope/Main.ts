import { world, Location, Player, MinecraftItemTypes, EntityRaycastOptions, MinecraftEffectTypes, DataDrivenEntityTriggerEvent } from "mojang-minecraft"
import { getTime } from "scripts/Utils/time.js"
import { alert } from "scripts/Utils/alert.js"
import { giveMainhand } from "scripts/Utils/giveMainhand.js"
import { spawnInRange } from "scripts/Utils/spawnInRange.js"

export class TelescopeHandler {
    /**
     * Whether a starfield is active in the world
     */
    protected inStarfield = false

    /**
     * The instance of the player who has interacted with the telescope.
     * Will only be defined when a player is in a starfield
     */
    protected player: Player

    constructor() {
        // Shouldn't be necessary, but do it just in case
        this.reset()

        // Register interact event handler
        world.events.dataDrivenEntityTriggerEvent.subscribe(this.onInteract)
    }

    /**
     * Method called when a telescope is interacted with
     */
    onInteract(event: DataDrivenEntityTriggerEvent) {
        const ow = world.getDimension('overworld')
        this.player = event.entity as Player

        if (!this.isAvailable(event.id)) return

        if (!giveMainhand(MinecraftItemTypes.spyglass, this.player)) return
        this.inStarfield = true
        const center = new Location(this.player.location.x, 500, this.player.location.z)
        this.player.teleport(center, ow, 0, 0)
        const controller = ow.spawnEntity('star:starfield_controller', center)
        controller.runCommandAsync('ride @p start_riding @s teleport_rider').then((res) => {
            if (res.successCount > 0) {
                ow.runCommand('time set midnight')
                alert([
                    { text: "You are now §dStargazing§r " },
                    { selector: '@s' },
                    { text: "! Using the §aSpyglass§r, find the §6Magical Star§r and zoom in on it..." }
                ], this.player)
                let progress = 0
                spawnInRange('star:star', center, 14, 14, 8)
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
                            if (entities.length > 0 && entities[0].id === 'star:star' && player.hasComponent('is_baby')) {
                                if (progress === 0) this.player.onScreenDisplay.setTitle('showstardisplay')
                                progress++
                            } else {
                                this.player.onScreenDisplay.setTitle('hidestardisplay')
                                progress = 0
                            }
                        } else {
                            this.player.onScreenDisplay.setTitle('hidestardisplay')
                            this.player.runCommand('clear @s spyglass 0 1')
                            this.player.runCommand('event entity @e[r=5,type=star:starfield_controller] star:on_complete')
                            this.player.triggerEvent('star:queue_starfall')
                            this.inStarfield = false

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

    /**
     * Whether the starfield is available to be used by the player
     * @returns A boolean representing whether the starfield is available
     */
    isAvailable(eventId: string) {
        const ow = world.getDimension('overworld')
        const time = getTime()
        const isMidnight = time >= 17000 && time <= 22000

        if (eventId === 'star:begin_starfield' && !this.inStarfield && this.player.dimension === ow && isMidnight) {
            return true
        } else if (eventId === 'star:begin_starfield' && this.inStarfield && this.player.dimension === ow && isMidnight) {
            alert([
                { text: 'Another player is amongst the stars... Please wait for them to be finished.' }
            ], this.player)
            return false
        } else if (eventId === 'star:begin_starfield' && !this.inStarfield && this.player.dimension !== ow && isMidnight) {
            alert([
                { text: 'You must be in the overworld to use the Telescope!' }
            ], this.player)
            return false
        } else if (eventId === 'star:begin_starfield' && !this.inStarfield && this.player.dimension === ow && !isMidnight) {
            alert([
                { text: 'The telescope can only be used during midnight.' }
            ], this.player)
            return false
        }
    }

    reset() {
        this.player = undefined
        this.inStarfield = false
    }
}
