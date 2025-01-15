/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingAnimator extends UpdateScriptComponent {
        @ƒ.serialize(ƒ.Animation)
        idle: ƒ.Animation;
        @ƒ.serialize(ƒ.Animation)
        walk: ƒ.Animation;
        @ƒ.serialize(ƒ.Animation)
        clickedOn: ƒ.Animation;
        @ƒ.serialize(ƒ.Animation)
        sit: ƒ.Animation;

        activeAnimation: EumlingAnimator.ANIMATIONS = EumlingAnimator.ANIMATIONS.IDLE;

        private animations: Map<EumlingAnimator.ANIMATIONS, ƒ.AnimationNodeAnimation> = new Map();
        private animTransition: ƒ.AnimationNodeTransition;
        private cmpAnim: ƒ.ComponentAnimationGraph;

        start(_e: CustomEvent<UpdateEvent>): void {

            this.animations.set(EumlingAnimator.ANIMATIONS.IDLE, new ƒ.AnimationNodeAnimation(this.idle));
            this.animations.set(EumlingAnimator.ANIMATIONS.WALK, new ƒ.AnimationNodeAnimation(this.walk));
            this.animations.set(EumlingAnimator.ANIMATIONS.CLICKED_ON, new ƒ.AnimationNodeAnimation(this.clickedOn));
            this.animations.set(EumlingAnimator.ANIMATIONS.SIT, new ƒ.AnimationNodeAnimation(this.sit));

            this.animTransition = new ƒ.AnimationNodeTransition(this.animations.get(EumlingAnimator.ANIMATIONS.IDLE));
            this.cmpAnim = new ƒ.ComponentAnimationGraph(this.animTransition);

            let importedScene = this.node.getChild(0);
            importedScene.getComponent(ƒ.ComponentAnimation).activate(false);
            importedScene.addComponent(this.cmpAnim);
        }
        update(_e: CustomEvent<UpdateEvent>): void {
            // throw new Error("Method not implemented.");
        }

        public transitionToAnimation(_anim: EumlingAnimator.ANIMATIONS, _time: number = 300){
            let anim = this.animations.get(_anim);
            if(!anim) return;
            this.animTransition.transit(anim, _time);
        }
    }

    export namespace EumlingAnimator {
        export enum ANIMATIONS {
            IDLE,
            WALK,
            CLICKED_ON,
            SIT,
        }
    }
}