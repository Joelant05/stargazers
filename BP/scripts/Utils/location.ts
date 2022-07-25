import { BlockLocation, Location } from "mojang-minecraft"

export function blockLocToLoc(blockLocation: BlockLocation) {
    return new Location(blockLocation.x, blockLocation.y, blockLocation.z)
}

export function locToBlockLoc(location: Location) {
    return new BlockLocation(
        Math.floor(location.x),
        Math.floor(location.y),
        Math.floor(location.z)
    )
}