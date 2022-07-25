import { world } from "mojang-minecraft"

export function getTime() {
    const ow = world.getDimension('overworld')
    return ow.runCommand('time query daytime').data
}