/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    export class EumlingMovement extends UpdateScriptComponent {
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        override start() {
            // console.log("start");
        };
        override update() {
            // console.log("update");
        };
    }
}