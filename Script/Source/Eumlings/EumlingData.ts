/// <reference path="../Plugins/UpdateScriptComponent.ts" />

namespace Script {
    export class EumlingData extends UpdateScriptComponent {
        static names: string[] = ["Herbert", "Fritz", "Martin", "Fitzhubert", "Horst"]
        name: string = "";
        start(_e: CustomEvent<UpdateEvent>): void {
            this.name = EumlingData.names[Math.floor(EumlingData.names.length * Math.random())];
        }
        update(_e: CustomEvent<UpdateEvent>): void {

        }
    }
}