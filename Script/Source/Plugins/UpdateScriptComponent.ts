namespace Script {
    import ƒ = FudgeCore;
    export interface UpdateEvent {
        deltaTime: number,
    }

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
            let event = new CustomEvent<UpdateEvent>("update", {detail: {deltaTime: ƒ.Loop.timeFrameGame}});
            for (let node of _branch) {
                for (let component of node.getAllComponents()) {
                    if (component instanceof UpdateScriptComponent) {
                        if (component.active)
                            component.dispatchEvent(event);
                    }
                }
            }
        }

        abstract start(_e: CustomEvent<UpdateEvent>): void;
        abstract update(_e: CustomEvent<UpdateEvent>): void;

    }
}