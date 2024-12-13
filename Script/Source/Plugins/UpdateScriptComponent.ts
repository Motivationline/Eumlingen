namespace Script {
    import ƒ = FudgeCore;
    export abstract class UpdateScriptComponent extends ƒ.Component {
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            this.addEventListener("update", this.start, { once: true })
            this.addEventListener("update", this.update)
        }

        // runs updates of all updateable components
        public static updateAllInBranch(_branch: ƒ.Node) {
            let event = new CustomEvent("update");
            for (let node of _branch) {
                for (let component of node.getAllComponents()) {
                    if (component instanceof UpdateScriptComponent) {
                        if (component.active)
                            component.dispatchEvent(event);
                    }
                }
            }
        }

        abstract start(): void;
        abstract update(): void;

    }
}