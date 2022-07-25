import { Location, world } from "mojang-minecraft"

export function spawnInRange(
    entityId: string,
    location: Location,
    distX: number,
    distZ: number,
    distY: number,
) {
    const xOffset = Math.random() >= 0.5 ? location.x + ((Math.random() + 0.3) * distX) : location.x - ((Math.random() + 0.3) * distX)
    const zOffset = Math.random() >= 0.5 ? location.z + ((Math.random() + 0.3) * distZ) : location.z - ((Math.random() + 0.3) * distZ)
    const yOffset = Math.random() >= 0.5 ? location.y + ((Math.random() + 0.3) * distY) : location.y - ((Math.random() + 0.3) * distY)
    const chosenLocation = new Location(
        xOffset,
        yOffset,
        zOffset
    )
    return world.getDimension('overworld')
        .spawnEntity(entityId, chosenLocation)
}