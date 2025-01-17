/// <reference path="../Plugins/UpdateScriptComponent.ts" />
/// <reference path="../Eumlings/Traits.ts" />

namespace Script {
    export class EumlingData extends UpdateScriptComponent implements Clickable {
        static names: string[] = ["Herbert", "Fritz", "Martin", "Fitzhubert", "Horst", "Aluni", "Lyraen", "Nivrel", "Elvaris", "Sylin", "Veyla", "Auren", "Liriel", "Riva", "Moraen", "Tynel", "Lymra", "Ondis", "Floren", "Nymra", "Aeris", "Erya", "Thyra", "Nyra", "Velin", "Fenya", "Arion", "Sylva", "Caelis", "Plenna", "Quira", "Lumel", "Flimra", "Vonae", "Tivra", "Elna", "Myrel"]
        name: string = "";
        traits: Set<TRAIT> = new Set<TRAIT>();
        start(_e: CustomEvent<UpdateEvent>): void {
            this.name = EumlingData.names[Math.floor(EumlingData.names.length * Math.random())];
            while (this.traits.size < 2) {
                this.traits.add(randomEnum(TRAIT));
            }
        }


        shortTap(_pointer: Pointer): void {
            this.showSelf();
        }

        private showSelf() {
            this.node.addComponent(eumlingCamera);
            eumlingViewport.setBranch(this.node);
            let infoOverlay = document.getElementById("eumling-upgrade-overlay");
            (<HTMLElement>infoOverlay.querySelector("#eumling-name")).innerText = this.name;

            let traitsDiv = infoOverlay.querySelector("div#eumling-traits");
            traitsDiv.innerHTML = "";
            let traits = Array.from(this.traits.keys());
            for (let i: number = 0; i < 4; i++) {
                let trait = traitInfo.get(traits[i]);
                if (trait) {
                    traitsDiv.innerHTML += `<div class="eumling-trait"><img src="Images/${trait.image}" /><span>${trait.name}</span></div>`
                } else {
                    traitsDiv.innerHTML += `<div class="eumling-trait empty"></div>`;
                }
            }

            showLayer(infoOverlay, { onRemove: () => { eumlingCameraActive = false; }, onAdd: () => { eumlingCameraActive = true } });

            this.node.getComponent(EumlingAnimator).overlayAnimation(EumlingAnimator.ANIMATIONS.CLICKED_ON);
        }
    }
}