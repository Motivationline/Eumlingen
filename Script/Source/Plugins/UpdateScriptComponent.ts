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

        abstract start(): void;
        abstract update(): void;

    }
}