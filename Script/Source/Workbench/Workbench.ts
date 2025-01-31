/// <reference path="../Eumlings/Traits.ts" />

namespace Script {
    import ƒ = FudgeCore;

    export interface BaseCategory {
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
        ANIMALS = 100,
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
                img: "Station_Natur.svg",
                subcategories: [
                    { id: SUBCATEGORY.ANIMALS, img: "Station_Tierwirtschaft.svg", name: "Tierwirtschaft", preferredTraits: [TRAIT.ANIMAL_LOVER, TRAIT.SOCIAL] },
                    { id: SUBCATEGORY.FARMING, img: "Station_Landwirtschaft.svg", name: "Landwirtschaft", preferredTraits: [TRAIT.NATURE_CONNECTION, TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.GARDENING, img: "Station_Gartenbau.svg", name: "Gartenbau", preferredTraits: [TRAIT.NATURE_CONNECTION, TRAIT.ARTISTIC] },
                ]
            },
            {
                id: CATEGORY.CRAFT,
                name: "Handwerk",
                img: "Station_Handwerk.svg",
                subcategories: [
                    { id: SUBCATEGORY.MATERIAL_EXTRACTION, img: "Station_Rohstoffgewinnung.svg", name: "Rohstoffgewinnung", preferredTraits: [TRAIT.BODY_STRENGTH, TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.PRODUCTION, img: "Station_Produktion.svg", name: "Produktion", preferredTraits: [TRAIT.FINE_MOTOR_SKILLS, TRAIT.PATIENCE] },
                    { id: SUBCATEGORY.PROCESSING, img: "Station_Verarbeitung.svg", name: "Verarbeitung", preferredTraits: [TRAIT.ARTISTIC, TRAIT.FINE_MOTOR_SKILLS] },
                ]
            },
        ]

        private readonly buildSpeed: number = 1 / 10;
        private readonly timeUntilNewTraitRange: [number, number] = [20000, 90000];
        private category: CATEGORY | undefined = undefined;
        private subcategory: SUBCATEGORY | undefined = undefined;
        private buildProgress: number = 0;
        private assignee: ƒ.Node;
        private fittingTraits: number = 0;
        private startWorkTime: number = 0;
        private timeUntilNewTrait: number = Infinity;

        start(_e: CustomEvent<UpdateEvent>): void {
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
                if (this.buildProgress < 1) {
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
            const title = <HTMLElement>overlay.querySelector(".workbench-options-title");
            const options = overlay.querySelector("div#workbench-options-wrapper");

            title.innerText = _title;

            let newOptions: HTMLElement[] = [];
            for (let opt of _options) {
                const div = document.createElement("div");
                div.classList.add("workbench-option", "button");
                div.innerHTML = `<img src="Assets/UI/Stationen/${opt.img}" alt="${opt.name}" /><span>${opt.name}</span>`
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
            let categoryCounter: number = 0;
            for (let cat of categories) {
                if (!cat) continue;
                if (categoryCounter > 0) {
                    info.innerHTML += `<div class="workbench-category-divider"></div>`
                }
                info.innerHTML += `<div class="workbench-category"><img src="Assets/UI/Stationen/${cat.img}" alt="${cat.name}" /><span>${cat.name}</span></div>`
                categoryCounter++;
            }

            let deconstructBtn = overlay.querySelector("#workbench-deconstruct");
            let deconstructBtn2 = deconstructBtn.cloneNode(true);
            deconstructBtn.replaceWith(deconstructBtn2);

            deconstructBtn2.addEventListener("click", this.deconstruct);

            return overlay;
        }

        private deconstruct = () => {
            this.resetAll();
            removeTopLayer();
            globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "deconstructWorkbench", data: { workbench: this } } }));
        }

        private setCategory(_id: number) {
            if (this.category === undefined) {
                this.category = _id;
                this.node.dispatchEvent(new CustomEvent("setVisual", { detail: { id: this.category, prepare: true } }));
            } else if (this.subcategory === undefined) {
                this.subcategory = _id;
                this.node.dispatchEvent(new CustomEvent("setVisual", { detail: { id: _id } }));
            }
        }
        private resetAll() {
            this.category = this.subcategory = undefined;
            this.buildProgress = 0;

            this.node.dispatchEvent(new CustomEvent("setVisual", { detail: { id: 0 } }));
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

        get needsAssembly(): boolean {
            return (this.category && this.buildProgress < 1);
        }

        work(_eumling: ƒ.Node, _timeMS: number): number {
            if (this.assignee !== _eumling) {
                this.assignNewEumling(_eumling);
            }
            if (!this.category) {
                this.unassignEumling();
            } else if (!this.subcategory) {
                if (this.buildProgress < 1) {
                    this.buildProgress += this.buildSpeed * _timeMS / 1000;
                } else {
                    this.node.dispatchEvent(new CustomEvent("setVisual", { detail: { id: this.category } }));
                    this.unassignEumling();
                }
            }
            if (this.assignee) {
                globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "eumlingWorkingAtWorkbench", data: { workTime: ƒ.Time.game.get() - this.startWorkTime } } }));
                if (this.fittingTraits < 2) {
                    this.attemptToTeachNewTrait(_timeMS);
                }
            }
            return this.fittingTraits;
        }

        private attemptToTeachNewTrait(_timeMS: number) {
            if (!this.subcategory) return;
            let data = this.assignee.getComponent(EumlingData);
            if (data.traits.size >= 4) return;
            this.timeUntilNewTrait -= _timeMS;
            if (this.timeUntilNewTrait > 0) return;
            let requiredTraits: TRAIT[] = [...Workbench.getSubcategoryFromId(this.subcategory).preferredTraits];
            shuffleArray(requiredTraits);
            for (let trait of requiredTraits) {
                if (!data.traits.has(trait)) {
                    data.traits.add(trait);
                    break;
                }
            }
            this.fittingTraits++;
            globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "eumlingDevelopTrait", data: { fittingTraits: this.fittingTraits, traits: data.traits, eumling: this.assignee } } }));
            const ew = this.assignee.getComponent(EumlingWork)
            ew.updateWorkAnimation(ew.getWorkAnimation(this.fittingTraits));
            this.setTimeUntilNewTrait();
        }

        private setTimeUntilNewTrait() {
            this.timeUntilNewTrait = randomRange(this.timeUntilNewTraitRange[0], this.timeUntilNewTraitRange[1]);
        }

        private assignNewEumling(_eumling: ƒ.Node) {
            this.unassignEumling();
            this.setTimeUntilNewTrait();
            this.assignee = _eumling;
            this.startWorkTime = ƒ.Time.game.get();

            this.fittingTraits = 0;
            if (this.subcategory) {
                let sub = Workbench.getSubcategoryFromId(this.subcategory);
                let assigneeTraits = this.assignee.getComponent(EumlingData).traits;
                for (let t of sub.preferredTraits) {
                    if (assigneeTraits.has(t)) this.fittingTraits++;
                }
                globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "assignEumling", data: { fittingTraits: this.fittingTraits } } }));
            }
        }

        unassignEumling() {
            if (!this.assignee) return;
            this.assignee.getComponent(EumlingWork).unassign();
            this.assignee = undefined;
            globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "unassignEumling", data: { workTime: ƒ.Time.game.get() - this.startWorkTime } } }));
        }
    }
}