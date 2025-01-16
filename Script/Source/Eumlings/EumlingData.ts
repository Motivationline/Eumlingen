/// <reference path="../Plugins/UpdateScriptComponent.ts" />

namespace Script {
    export class EumlingData extends UpdateScriptComponent implements Clickable {
        static names: string[] = ["Herbert", "Fritz", "Martin", "Fitzhubert", "Horst", "Aluni", "Lyraen", "Nivrel", "Elvaris", "Sylin", "Veyla", "Auren", "Liriel", "Riva", "Moraen", "Tynel", "Lymra", "Ondis", "Floren", "Nymra", "Aeris", "Erya", "Thyra", "Nyra", "Velin", "Fenya", "Arion", "Sylva", "Caelis", "Plenna", "Quira", "Lumel", "Flimra", "Vonae", "Tivra", "Elna", "Myrel"]
        name: string = "";
        traits: Set<TRAIT> = new Set<TRAIT>();
        start(_e: CustomEvent<UpdateEvent>): void {
            this.name = EumlingData.names[Math.floor(EumlingData.names.length * Math.random())];
            while (this.traits.size < 2) {
                this.traits.add(randEnumValue(TRAIT));
            }
        }


        shortTap(_pointer: Pointer): void {
            this.showSelf();
        }

        longTap(_pointer: Pointer): void {
            this.node.activate(false);
        }

        private showSelf() {
            this.node.addComponent(eumlingCamera);
            eumlingViewport.setBranch(this.node);
            let infoOverlay = document.getElementById("eumling-upgrade-overlay");
            (<HTMLElement>infoOverlay.querySelector("#eumling-name")).innerText = this.name;

            showLayer(infoOverlay, { onRemove: () => { eumlingCameraActive = false; }, onAdd: () => { eumlingCameraActive = true } });

            this.node.getComponent(EumlingAnimator).overlayAnimation(EumlingAnimator.ANIMATIONS.CLICKED_ON);
        }
    }
}