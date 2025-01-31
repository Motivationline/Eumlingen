namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class WorkbenchVisuals extends UpdateScriptComponent {
        @ƒ.serialize(ƒ.Graph)
        default: ƒ.Graph;

        @ƒ.serialize(ƒ.Graph)
        nature_prepare: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature_animals: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature_farming: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        nature_gardening: ƒ.Graph;

        @ƒ.serialize(ƒ.Graph)
        craft_prepare: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft_mat_extr: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft_production: ƒ.Graph;
        @ƒ.serialize(ƒ.Graph)
        craft_processing: ƒ.Graph;

        #graphs: Map<number, ƒ.Graph> = new Map();
        #graphsPrepare: Map<number, ƒ.Graph> = new Map();
        #nodes: Map<number, ƒ.Node> = new Map();
        #nodesPrepare: Map<number, ƒ.Node> = new Map();
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

            this.#graphsPrepare.set(CATEGORY.NATURE, this.nature_prepare);
            this.#graphsPrepare.set(CATEGORY.CRAFT, this.craft_prepare);

            // using setTimeout because it's a workaround for https://github.com/hs-furtwangen/FUDGE/issues/56
            setTimeout(() => { this.setVisual(0) }, 0);

            this.node.addEventListener("setVisual", this.hndSetVisual);
        }

        private hndSetVisual = (_e: CustomEvent) => {
            // using setTimeout because it's a workaround for https://github.com/hs-furtwangen/FUDGE/issues/56
            setTimeout(() => { this.setVisual(_e.detail.id, _e.detail.prepare) }, 0);
        }

        async setVisual(_id: number, _prepare: boolean = false) {
            let node: ƒ.Node;
            if (_prepare) {
                let graph = this.#graphsPrepare.get(_id);
                if (!graph) return;
                node = this.#nodesPrepare.get(_id);
                if (!node) {
                    node = await ƒ.Project.createGraphInstance(graph);
                    this.#nodesPrepare.set(_id, node);
                }
            } else {
                let graph = this.#graphs.get(_id);
                if (!graph) return;
                node = this.#nodes.get(_id);
                if (!node) {
                    node = await ƒ.Project.createGraphInstance(graph);
                    this.#nodes.set(_id, node);
                }
            }
            this.node.removeAllChildren();

            this.node.appendChild(node);
        }
    }
}