import { Player, world, MinecraftEffectTypes, Location } from "mojang-minecraft"
import { alert } from "scripts/Utils/alert.js"
import { Rift } from "scripts/Gameplay/Rift/Main.js"
import { wait } from "scripts/Utils/wait.js"

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
        this.event = 'rift' // remove when done testing
        console.warn(this.event)
        switch (this.event) {
            case 'positiveEffects': {
                alert([
                    { text: '§6Tonights star has chosen your fate§r ' },
                    { selector: '@s' },
                    { text: '!\n You have been §ablessed with potion effects§r for §b4 minutes§r.' }
                ], player)

                const options = [
                    () => player.addEffect(MinecraftEffectTypes.absorption, 4800, 2, false),
                    () => player.addEffect(MinecraftEffectTypes.haste, 4800, 3, false),
                    () => player.addEffect(MinecraftEffectTypes.strength, 4800, 2, false),
                    () => player.addEffect(MinecraftEffectTypes.regeneration, 4800, 1, false),
                    () => player.addEffect(MinecraftEffectTypes.speed, 4800, 2, false),
                ]

                let hasAdded = false
                for (const effect of options) {
                    if (Math.random() >= 0.6) {
                        effect()
                        hasAdded = true
                    }
                }
                if (hasAdded === false) player.addEffect(MinecraftEffectTypes.regeneration, 4800, 2, false)
                break
            }
            case 'negativeEffects': {
                alert([
                    { text: '§6Tonights star has chosen your fate§r ' },
                    { selector: '@s' },
                    { text: '!\n You have been §ccursed with potion effects§r for §b3 minutes§r' }
                ], player)

                const options = [
                    () => player.addEffect(MinecraftEffectTypes.badOmen, 3600, 1, false),
                    () => player.addEffect(MinecraftEffectTypes.hunger, 3600, 1, false),
                    () => player.addEffect(MinecraftEffectTypes.miningFatigue, 3600, 0, false),
                ]

                let hasAdded = false
                for (const effect of options) {
                    if (Math.random() >= 0.6) {
                        effect()
                        hasAdded = true
                    }
                }
                if (hasAdded === false) player.addEffect(MinecraftEffectTypes.slowness, 3600, 1, false)
                break
            }
            case 'rift': {
                alert([
                    { text: '§6Tonights star has chosen your fate§r ' },
                    { selector: '@s' },
                    { text: '!\n A §crift§r has opened. Defend our world from the invaders until the rift closes.' }
                ], player)

                const rift = new Rift(player.location)
                alert([
                    { text: 'Enemies will arrive in §b20 seconds§r! Get ready...' }
                ], player)
                wait(10).then(() => {
                    alert([
                        { text: 'Enemies will arrive in §b10 seconds§r!' }
                    ], player)
                })
                wait(20).then(() => {
                    rift.start()
                })
                break
            }
        }
    }
}