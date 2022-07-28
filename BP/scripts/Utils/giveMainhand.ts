import { Player, EntityInventoryComponent, PlayerInventoryComponentContainer, ItemStack, ItemType } from "mojang-minecraft"

export function giveMainhand(item: ItemType, player: Player) {
    const inventory = player.getComponent('inventory') as EntityInventoryComponent
    const container = inventory.container as PlayerInventoryComponentContainer

    if (container.emptySlotsCount === 0) return false

    const current = container.getItem(player.selectedSlot)

    if (current) {
        // Move current item out of the way first
        for (let i = 0; i < container.size; i++) {
            const presentItem = container.getItem(i)
            if (!presentItem) {
                container.setItem(i, current)
                container.setItem(player.selectedSlot, new ItemStack(item, 1))
                return true
            }
        }
        container.setItem(player.selectedSlot, new ItemStack(item, 1))
    } else {
        container.setItem(player.selectedSlot, new ItemStack(item, 1))
        return true
    }
}