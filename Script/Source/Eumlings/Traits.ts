namespace Script {
    export enum TRAIT {
        ANIMAL_LOVER,
        SOCIAL,
        NATURE_CONNECTION,
        ORGANIZED,
        ARTISTIC,
        BODY_STRENGTH,
        FINE_MOTOR_SKILLS,
        PATIENCE,
    }

    interface TraitData {
        name: string,
        image: string,
    }
    export const traitInfo: Map<TRAIT, TraitData> = new Map<TRAIT, TraitData>([
        [TRAIT.ANIMAL_LOVER, {image: "placeholder.png", name: "Tierlieb"}],
        [TRAIT.ARTISTIC, {image: "placeholder.png", name: "Künstlerisch"}],
        [TRAIT.BODY_STRENGTH, {image: "placeholder.png", name: "Körperkraft"}],
        [TRAIT.FINE_MOTOR_SKILLS, {image: "placeholder.png", name: "Feinmotorisch"}],
        [TRAIT.NATURE_CONNECTION, {image: "placeholder.png", name: "Naturverbunden"}],
        [TRAIT.ORGANIZED, {image: "placeholder.png", name: "Organisiert"}],
        [TRAIT.PATIENCE, {image: "placeholder.png", name: "Geduldig"}],
        [TRAIT.SOCIAL, {image: "placeholder.png", name: "Sozial"}],
    ])
}