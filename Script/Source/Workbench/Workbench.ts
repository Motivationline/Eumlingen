/// <reference path="../Eumlings/Traits.ts" />

namespace Script {
    import ƒ = FudgeCore;

    export interface Category {
        id: CATEGORY,
        subcategories: Subcategory[],
    }

    export interface Subcategory {
        id: SUBCATEGORY,
        preferredTraits: TRAIT[],
    }

    export enum CATEGORY {
        NATURE,
        CRAFT,
    }
    export enum SUBCATEGORY {
        ANIMALS,
        FARMING,
        GARDENING,
        MATERIAL_EXTRACTION,
        PRODUCTION,
        PROCESSING,
    }

    export class Workbench extends UpdateScriptComponent implements Clickable {
        static categories: Category[] = [
            {
                id: CATEGORY.NATURE,
                subcategories: [
                    { id: SUBCATEGORY.ANIMALS, preferredTraits: [TRAIT.ANIMAL_LOVER, TRAIT.SOCIAL] },
                    { id: SUBCATEGORY.FARMING, preferredTraits: [TRAIT.NATURE_CONNECTION, TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.GARDENING, preferredTraits: [TRAIT.NATURE_CONNECTION, TRAIT.ARTISTIC] },
                ]
            },
            {
                id: CATEGORY.CRAFT,
                subcategories: [
                    { id: SUBCATEGORY.MATERIAL_EXTRACTION, preferredTraits: [TRAIT.BODY_STRENGTH, TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.PRODUCTION, preferredTraits: [TRAIT.FINE_MOTOR_SKILLS, TRAIT.PATIENCE] },
                    { id: SUBCATEGORY.PROCESSING, preferredTraits: [TRAIT.ARTISTIC, TRAIT.FINE_MOTOR_SKILLS] },
                ]
            },
        ]

        private category: CATEGORY | undefined = undefined;
        private subcategory: SUBCATEGORY | undefined = undefined;

        shortTap(_pointer: Pointer): void {
            this.displayWorkbenchInfo();
        }
        longTap(_pointer: Pointer): void {
            this.displayWorkbenchInfo();
        }

        displayWorkbenchInfo(){
            const overlay = document.getElementById("workbench-info-overlay");
            
            showLayer(overlay);
        }
    }

}