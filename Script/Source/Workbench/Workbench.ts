/// <reference path="../Eumlings/Traits.ts" />

namespace Script {
    import ƒ = FudgeCore;

    interface BaseCategory {
        img: string,
        name: string,
        id: number,
    }

    export interface Category extends BaseCategory {
        id: CATEGORY,
        subcategories: Subcategory[],
    }

    export interface Subcategory extends BaseCategory {
        id: SUBCATEGORY,
        preferredTraits: TRAIT[],
    }

    export enum CATEGORY {
        NATURE = 1,
        CRAFT,
    }
    export enum SUBCATEGORY {
        ANIMALS = 1,
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
                name: "Natur",
                img: "",
                subcategories: [
                    { id: SUBCATEGORY.ANIMALS, img: "", name: "Tierwirtschaft", preferredTraits: [TRAIT.ANIMAL_LOVER, TRAIT.SOCIAL] },
                    { id: SUBCATEGORY.FARMING, img: "", name: "Landwirtschaft", preferredTraits: [TRAIT.NATURE_CONNECTION, TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.GARDENING, img: "", name: "Gartenbau", preferredTraits: [TRAIT.NATURE_CONNECTION, TRAIT.ARTISTIC] },
                ]
            },
            {
                id: CATEGORY.CRAFT,
                name: "Handwerk",
                img: "",
                subcategories: [
                    { id: SUBCATEGORY.MATERIAL_EXTRACTION, img: "", name: "Rohstoffgewinnung", preferredTraits: [TRAIT.BODY_STRENGTH, TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.PRODUCTION, img: "", name: "Produktion", preferredTraits: [TRAIT.FINE_MOTOR_SKILLS, TRAIT.PATIENCE] },
                    { id: SUBCATEGORY.PROCESSING, img: "", name: "Verarbeitung", preferredTraits: [TRAIT.ARTISTIC, TRAIT.FINE_MOTOR_SKILLS] },
                ]
            },
        ]

        private category: CATEGORY | undefined = undefined;
        private subcategory: SUBCATEGORY | undefined = undefined;
        private buildProgress: number = 0;
        private readonly buildSpeed: number = 1 / 10;
        private assignee: ƒ.Node;
        private matColor: ƒ.Color;

        start(_e: CustomEvent<UpdateEvent>): void {
            this.matColor = this.node.getComponent(ƒ.ComponentMaterial).clrPrimary;
        }

        shortTap(_pointer: Pointer): void {
            this.displayWorkbenchInfo();
        }
        longTap(_pointer: Pointer): void {
            this.displayWorkbenchInfo();
        }

        private displayWorkbenchInfo() {
            let overlay: HTMLElement;
            if (!this.category) {
                overlay = this.fillUpgradeOverlayWithInfo("Wähle eine Kategorie", Workbench.categories);
            } else if (!this.subcategory) {
                if(this.buildProgress < 1){
                    overlay = this.fillInfoOverlayWithInfo();
                } else {
                    overlay = this.fillUpgradeOverlayWithInfo("Wähle eine Spezialisierung", Workbench.categories.find(c => c.id === this.category).subcategories);
                }
            } else {
                overlay = this.fillInfoOverlayWithInfo();
            }

            if (!overlay) return;
            showLayer(overlay);
        }

        private fillUpgradeOverlayWithInfo(_title: string, _options: BaseCategory[]): HTMLElement {
            const overlay = document.getElementById("workbench-upgrade-overlay");
            const title = overlay.querySelector("h2");
            const options = overlay.querySelector("div#workbench-options-wrapper");

            title.innerText = _title;

            let newOptions: HTMLElement[] = [];
            for (let opt of _options) {
                const div = document.createElement("div");
                div.classList.add("workbench-option", "button");
                div.innerHTML = `<img src="${opt.img}" alt="${opt.name}" /><span>${opt.name}</span>`
                newOptions.push(div);
                div.addEventListener("click", () => {
                    this.setCategory(opt.id);
                    removeTopLayer();
                })
            }
            options.replaceChildren(...newOptions);

            return overlay;
        }

        private fillInfoOverlayWithInfo(): HTMLElement {
            const overlay = document.getElementById("workbench-info-overlay");
            const info = overlay.querySelector("div#workbench-info-categories");

            let categories = [Workbench.getCategoryFromId(this.category), Workbench.getSubcategoryFromId(this.subcategory)];
            info.innerHTML = "";
            for(let cat of categories){
                if(!cat) continue;
                info.innerHTML += `<div class="workbench-category"><img src="${cat.img}" alt="${cat.name}" /><span>${cat.name}</span></div>`
            }

            overlay.querySelector("progress").value = this.buildProgress;

            overlay.querySelector("#workbench-deconstruct").addEventListener("click", () => {
                this.resetCategory();
                removeTopLayer();
            })

            return overlay;
        }

        private setCategory(_id: number) {
            if (this.category === undefined) {
                this.category = _id;
            } else if (this.subcategory === undefined) {
                this.subcategory = _id;
            }
        }
        private resetCategory() {
            this.category = this.subcategory = undefined;
        }

        static getCategoryFromId(_id: CATEGORY): Category {
            return this.categories.find(c => c.id === _id);
        }
        static getSubcategoryFromId(_id: SUBCATEGORY): Subcategory {
            for (let cat of this.categories) {
                let found = cat.subcategories.find(c => c.id === _id);
                if (found) return found;
            }
            return undefined;
        }

        work(_eumling: ƒ.Node, _timeMS: number) {
            if (this.assignee !== _eumling) {
                this.unassignEumling();
                this.assignee = _eumling;
            }
            if (!this.category) {
                this.unassignEumling();
            } else if (!this.subcategory) {
                if (this.buildProgress < 1) {
                    this.buildProgress += this.buildSpeed * _timeMS / 1000;
                    this.matColor.b = this.buildProgress;
                } else {
                    this.unassignEumling();
                }
            }
        }

        unassignEumling() {
            if (!this.assignee) return;
            this.assignee.getComponent(EumlingWork).unassign();
            this.assignee = undefined;
        }
    }

}