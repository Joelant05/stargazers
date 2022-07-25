import { Player, world, SoundOptions } from "mojang-minecraft"

export function alert(message: any[], player: Player) {
    player.runCommand(`tellraw @s {"rawtext": ${JSON.stringify(message)}}`)
    const opts = new SoundOptions()
    opts.volume = 0.25
    player.playSound('random.anvil_land', opts)
}
