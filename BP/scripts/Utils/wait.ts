import { world } from "mojang-minecraft"

/**
 * Create a promise that resolves after a specified amount of time
 * @param time The amount of time to wait, in seconds
 */
export function wait(time: number) {
    return new Promise<void>((resolve) => {
        let tickCounter = 0
        const tick = world.events.tick.subscribe((event) => {
            if (tickCounter >= time * 20) {
                world.events.tick.unsubscribe(tick)
                resolve()
            }
            tickCounter++
        })
    })
}