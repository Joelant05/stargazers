import { BlockLocation, Player, world } from "mojang-minecraft"
import { Star } from "scripts/Gameplay/Stars/Star.js"

export class StarGenerator {
    canGenerate = true

    constructor() {
        world.events.tick.subscribe((event) => {
            const ten = event.currentTick % 200 === 0
            if (ten) {
                console.warn('run')
                const ow = world.getDimension('overworld')
                const time = ow.runCommand('time query daytime').data
                const isMidnight = time >= 16000 && time <= 20000
                const isMidday = time >= 1000 && time <= 5000
                if (isMidday) {
                    console.warn('reset')
                    this.canGenerate = true
                }
                if (isMidnight && this.canGenerate) this.choosePlayer()
            }
        })
    }

    choosePlayer() {
        const players = Array.from(world.getPlayers()).filter((player => player.location.y <= 125 && player.dimension === world.getDimension('overworld')))
        const random = Math.floor(Math.random() * players.length)
        if (players.length > 0) {
            this.spawnStar(players[random])
        }
    }

    spawnStar(player: Player) {
        const position = new BlockLocation(
            Math.floor(player.location.x) + (Math.random() * 40),
            200,
            Math.floor(player.location.z) + (Math.random() * 40)
        )
        console.warn(position.x, position.y, position.z)
        new Star(position)
        this.canGenerate = false
    }
}