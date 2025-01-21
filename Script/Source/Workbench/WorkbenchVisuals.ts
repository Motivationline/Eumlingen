namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class WorkbenchVisuals extends UpdateScriptComponent {
        @ƒ.serialize(ƒ.Graph)
        default: ƒ.Graph;

        @ƒ.serialize(ƒ.Graph)
        nature: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature_animals: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature_farming: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature_gardening: ƒ.Graph;

        @ƒ.serialize(ƒ.Graph)
        craft: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft_mat_extr: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft_production: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft_processing: ƒ.Graph;

        #graphs: Map<number, ƒ.Graph> = new Map();
        start(_e: CustomEvent<UpdateEvent>): void {
            this.#graphs.set(0, this.default);

            this.#graphs.set(CATEGORY.NATURE, this.nature);
            this.#graphs.set(SUBCATEGORY.ANIMALS, this.nature_animals);
            this.#graphs.set(SUBCATEGORY.FARMING, this.nature_farming);
            this.#graphs.set(SUBCATEGORY.GARDENING, this.nature_gardening);

            this.#graphs.set(CATEGORY.CRAFT, this.craft);
            this.#graphs.set(SUBCATEGORY.MATERIAL_EXTRACTION, this.craft_mat_extr);
            this.#graphs.set(SUBCATEGORY.PROCESSING, this.craft_processing);
            this.#graphs.set(SUBCATEGORY.PRODUCTION, this.craft_production);

            this.setVisual(0);

            this.node.addEventListener("setVisual", <EventListener>this.hndSetVisual);
        }

        private hndSetVisual = (_e: CustomEvent) => {
            this.setVisual(_e.detail);
        }

        setVisual(_id: number) {
            let graph = this.#graphs.get(_id);
            if (!graph) return;
            this.node.removeAllChildren();

            this.node.appendChild(graph);
        }
    }
}