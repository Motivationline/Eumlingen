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
        [TRAIT.ANIMAL_LOVER, {image: "Trait_Tierliebe.svg", name: "Tierlieb"}],
        [TRAIT.ARTISTIC, {image: "Trait_Künstlerisch.svg", name: "Künstlerisch"}],
        [TRAIT.BODY_STRENGTH, {image: "Trait_Körperkraft.svg", name: "Körperkraft"}],
        [TRAIT.FINE_MOTOR_SKILLS, {image: "Trait_Feinmotorisch.svg", name: "Feinmotorisch"}],
        [TRAIT.NATURE_CONNECTION, {image: "Trait_Naturverbunden.svg", name: "Naturverbunden"}],
        [TRAIT.ORGANIZED, {image: "Trait_Organisiert.svg", name: "Organisiert"}],
        [TRAIT.PATIENCE, {image: "Trait_Geduld.svg", name: "Geduldig"}],
        [TRAIT.SOCIAL, {image: "Trait_Sozial.svg", name: "Sozial"}],
    ])
}