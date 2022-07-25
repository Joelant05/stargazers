import { world, Location, Player, MinecraftItemTypes, EntityRaycastOptions, MinecraftEffectTypes } from "mojang-minecraft"
import { getTime } from "scripts/Utils/time.js"
import { alert } from "scripts/Utils/alert.js"
import { giveMainhand } from "scripts/Utils/giveMainhand.js"
import { spawnInRange } from "scripts/Utils/spawnInRange.js"

let inStarfield = false
world.events.dataDrivenEntityTriggerEvent.subscribe((event) => {
    const player = event.entity as Player
    const ow = world.getDimension('overworld')
    const time = getTime()
    const isMidnight = time >= 17000 && time <= 22000
    if (event.id === 'star:begin_starfield' && !inStarfield && player.dimension === ow && isMidnight) {
        if (!giveMainhand(MinecraftItemTypes.spyglass, player)) return
        inStarfield = true
        const center = new Location(player.location.x, 500, player.location.z)
        player.teleport(center, ow, 0, 0)
        const controller = ow.spawnEntity('star:starfield_controller', center)
        controller.runCommandAsync('ride @p start_riding @s teleport_rider').then((res) => {
            if (res.successCount > 0) {
                ow.runCommand('time set midnight')
                alert([
                    { text: "You are now §dStargazing§r " },
                    { selector: '@s' },
                    { text: "! Using the §aSpyglass§r, find the §6Magical Star§r and zoom in on it..." }
                ], player)
                let progress = 0
                spawnInRange('star:star', center, 14, 14, 8)
                player.addEffect(
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
                            const entities = player.getEntitiesFromViewVector(opts)
                            if (entities.length > 0 && entities[0].id === 'star:star' && player.hasComponent('is_baby')) {
                                if (progress === 0) player.onScreenDisplay.setTitle('showstardisplay')
                                progress++
                            } else {
                                player.onScreenDisplay.setTitle('hidestardisplay')
                                progress = 0
                            }
                        } else {
                            player.onScreenDisplay.setTitle('hidestardisplay')
                            player.runCommand('clear @s spyglass 0 1')
                            player.runCommand('event entity @e[r=5,type=star:starfield_controller] star:on_complete')
                            player.triggerEvent('star:queue_starfall')

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
    } else if (event.id === 'star:begin_starfield' && inStarfield && player.dimension === ow && isMidnight) {
        alert([
            { text: 'Another player is amongst the stars... Please wait for them to be finished.' }
        ], player)
    } else if (event.id === 'star:begin_starfield' && !inStarfield && player.dimension !== ow && isMidnight) {
        alert([
            { text: 'You must be in the overworld to use the Telescope!' }
        ], player)
    } else if (event.id === 'star:begin_starfield' && !inStarfield && player.dimension === ow && !isMidnight) {
        alert([
            { text: 'The telescope can only be used during midnight.' }
        ], player)
    }
})
