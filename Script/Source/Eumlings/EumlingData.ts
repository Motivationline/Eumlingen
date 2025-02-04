/// <reference path="../Plugins/UpdateScriptComponent.ts" />
/// <reference path="../Eumlings/Traits.ts" />

namespace Script {
    import ƒ = FudgeCore;
    enum EUMLING_SKIN {
        DEFAULT,
        SHINELING
    }

    @ƒ.serialize
    export class EumlingData extends UpdateScriptComponent implements Clickable {
        static names: string[] = ["Herbert", "Fritz", "Martin", "Fitzhubert", "Horst", "Aluni", "Lyraen", "Nivrel", "Elvaris", "Sylin", "Veyla", "Auren", "Liriel", "Riva", "Moraen", "Tynel", "Lymra", "Ondis", "Floren", "Nymra", "Aeris", "Erya", "Thyra", "Nyra", "Velin", "Fenya", "Arion", "Sylva", "Caelis", "Plenna", "Quira", "Lumel", "Flimra", "Vonae", "Tivra", "Elna", "Myrel"]
        #name: string = "";
        #traits: Set<TRAIT> = new Set<TRAIT>();
        #nameDisplay: ƒ.ComponentText;
        #cmpMat: ƒ.ComponentMaterial;

        static skins: Map<EUMLING_SKIN, ƒ.Material> = new Map();
        @ƒ.serialize(ƒ.Texture)
        shinelingTexture: ƒ.Texture;

        get traits() {
            return this.#traits;
        }

        start(_e: CustomEvent<UpdateEvent>): void {
            while (this.#traits.size < 2) {
                this.#traits.add(randomEnum(TRAIT));
            }
            this.#nameDisplay = this.node.getChildrenByName("Name")[0].getComponent(ƒ.ComponentText);
            this.name = EumlingData.names[Math.floor(EumlingData.names.length * Math.random())];
            this.#cmpMat = this.node.getChild(0).getChild(0).getChildrenByName("Retopo")[0].getChildrenByName("Retopo_Primitive0")[0].getComponent(ƒ.ComponentMaterial);
            this.initMaterials();
        }

        private initMaterials() {
            if (EumlingData.skins.size > 0) return;
            EumlingData.skins.set(EUMLING_SKIN.DEFAULT, this.#cmpMat.material);
            EumlingData.skins.set(EUMLING_SKIN.SHINELING, new ƒ.Material("shineling", ƒ.ShaderLitTexturedSkin, new ƒ.CoatTextured(new ƒ.Color(1, 1, 1, 1), this.shinelingTexture)));
        }

        get name(): string {
            return this.#name;
        }
        set name(_name) {
            this.#name = _name;
            this.#nameDisplay.texture.text = this.#name;
        }

        setSkin(_skin: EUMLING_SKIN = randomEnum(EUMLING_SKIN)) {
            let material: ƒ.Material = EumlingData.skins.get(_skin);
            if (!material) return;
            this.#cmpMat.material = material;
        }

        shortTap(_pointer: Pointer): void {
            if (this.node.getComponent(EumlingMovement).getState() === STATE.GROWN || _pointer.used) {
                return;
            }
            this.showSelf();
        }

        private showSelf() {
            this.node.addComponent(eumlingCamera);
            eumlingViewport.setBranch(this.node);
            let infoOverlay = document.getElementById("eumling-upgrade-overlay");
            (<HTMLElement>infoOverlay.querySelector("#eumling-name")).innerText = this.name;

            let traitsDiv = infoOverlay.querySelector("div#eumling-traits");
            traitsDiv.innerHTML = "";
            let traits = Array.from(this.#traits.keys());
            for (let i: number = 0; i < 4; i++) {
                let trait = traitInfo.get(traits[i]);
                if (trait) {
                    traitsDiv.innerHTML += `<div class="eumling-trait"><img src="Assets/UI/Traits/${trait.image}" /><span>${trait.name}</span></div>`
                } else {
                    traitsDiv.innerHTML += `<div class="eumling-trait empty"></div>`;
                }
            }

            showLayer(infoOverlay, { onRemove: () => { eumlingCameraActive = false; }, onAdd: () => { eumlingCameraActive = true } });

            this.node.getComponent(EumlingAnimator).overlayAnimation(EumlingAnimator.ANIMATIONS.CLICKED_ON);
        }
    }
}