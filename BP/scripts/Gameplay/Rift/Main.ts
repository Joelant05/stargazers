import { world, Location, Entity, MinecraftBlockTypes, IntBlockProperty, Block, EntityHealthComponent } from "mojang-minecraft"
import { locToBlockLoc } from "scripts/Utils/location.js"

export class Rift {
    /**
     * The entity instance of the rift
     */
    protected entity: Entity
    /**
     * The block instance of the light block used to give a light effect to the rift
     */
    protected lightBlock: Block

    /**
     * Current wave of the rift
     */
    protected currentWave: number = 0


    constructor(position: Location) {
        this.summon(position)
    }

    summon(position: Location) {
        const ow = world.getDimension('overworld')

        this.entity = ow.spawnEntity('star:rift', position)

        this.lightBlock = ow.getBlock(locToBlockLoc(position))
        this.lightBlock.setType(MinecraftBlockTypes.lightBlock)
        const permutation = this.lightBlock.permutation;
        (permutation.getProperty('block_light_level') as IntBlockProperty).value = 12
        this.lightBlock.setPermutation(permutation)
    }

    start() {
        this.entity.runCommand('playsound ambient.weather.thunder @a ~ ~ ~')
        this.progressWave()

        const mobDeathListener = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
            if (event.id === 'star:rift_mob_death') {
                const healthComp = this.entity.getComponent('health') as EntityHealthComponent
                healthComp.setCurrent(healthComp.current === 10 ? healthComp.current - 9 : healthComp.current - 10)
                if (healthComp.current === 1) {
                    const isDone = this.progressWave()
                    if (isDone) world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(mobDeathListener)
                }
            }
        })
    }

    progressWave() {
        this.currentWave++
        if (this.currentWave >= 4) {
            this.end()
            return true
        } else {
            const healthComp = this.entity.getComponent('health') as EntityHealthComponent
            healthComp.resetToMaxValue()
            this.entity.triggerEvent(`star:start_wave_${this.currentWave}`)
            return false
        }
    }

    end() {
        this.lightBlock.setType(MinecraftBlockTypes.air)
        this.entity.triggerEvent('star:end')
    }
}