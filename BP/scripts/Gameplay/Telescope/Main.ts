import { world, Player, DataDrivenEntityTriggerEvent } from "mojang-minecraft"
import { getTime } from "scripts/Utils/time.js"
import { alert } from "scripts/Utils/alert.js"
import { Starfield } from "scripts/Gameplay/Telescope/Starfield.js"

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
        this.player = event.entity as Player

        if (!this.isAvailable(event.id)) return

        const starfield = new Starfield(this.player)
        starfield.events.onStart = () => this.inStarfield = true
        starfield.events.onComplete = () => this.inStarfield = false
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
