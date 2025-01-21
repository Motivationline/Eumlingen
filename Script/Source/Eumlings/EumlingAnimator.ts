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
        @ƒ.serialize(ƒ.Animation)
        pick: ƒ.Animation;
        @ƒ.serialize(ƒ.Animation)
        fall: ƒ.Animation;
        @ƒ.serialize(ƒ.Animation)
        work_build: ƒ.Animation;
        @ƒ.serialize(ƒ.Vector3)
        work_build_offset: ƒ.Vector3 = new ƒ.Vector3();
        @ƒ.serialize(ƒ.Animation)
        work_bad: ƒ.Animation;
        @ƒ.serialize(ƒ.Vector3)
        work_bad_offset: ƒ.Vector3 = new ƒ.Vector3();
        @ƒ.serialize(ƒ.Animation)
        work_normal: ƒ.Animation;
        @ƒ.serialize(ƒ.Vector3)
        work_normal_offset: ƒ.Vector3 = new ƒ.Vector3();
        @ƒ.serialize(ƒ.Animation)
        work_good: ƒ.Animation;
        @ƒ.serialize(ƒ.Vector3)
        work_good_offset: ƒ.Vector3 = new ƒ.Vector3();

        activeAnimation: EumlingAnimator.ANIMATIONS = EumlingAnimator.ANIMATIONS.IDLE;

        private animations: Map<EumlingAnimator.ANIMATIONS, ƒ.AnimationNodeAnimation> = new Map();
        private offsets: Map<EumlingAnimator.ANIMATIONS, ƒ.Vector3> = new Map();
        private animPlaying: ƒ.AnimationNodeTransition;
        private animOverlay: ƒ.AnimationNodeTransition;
        private cmpAnim: ƒ.ComponentAnimationGraph;

        prestart(_e: CustomEvent<UpdateEvent>): void {
            this.animations.set(EumlingAnimator.ANIMATIONS.EMPTY, new ƒ.AnimationNodeAnimation());
            this.animations.set(EumlingAnimator.ANIMATIONS.IDLE, new ƒ.AnimationNodeAnimation(this.idle));
            this.animations.set(EumlingAnimator.ANIMATIONS.WALK, new ƒ.AnimationNodeAnimation(this.walk));
            this.animations.set(EumlingAnimator.ANIMATIONS.CLICKED_ON, new ƒ.AnimationNodeAnimation(this.clickedOn, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE }));
            this.animations.set(EumlingAnimator.ANIMATIONS.SIT, new ƒ.AnimationNodeAnimation(this.sit, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE }));
            this.animations.set(EumlingAnimator.ANIMATIONS.PICKED, new ƒ.AnimationNodeAnimation(this.pick));
            this.animations.set(EumlingAnimator.ANIMATIONS.FALL, new ƒ.AnimationNodeAnimation(this.fall));
            this.animations.set(EumlingAnimator.ANIMATIONS.WORK_BUILD, new ƒ.AnimationNodeAnimation(this.work_build));
            this.animations.set(EumlingAnimator.ANIMATIONS.WORK_BAD, new ƒ.AnimationNodeAnimation(this.work_bad));
            this.animations.set(EumlingAnimator.ANIMATIONS.WORK_NORMAL, new ƒ.AnimationNodeAnimation(this.work_normal));
            this.animations.set(EumlingAnimator.ANIMATIONS.WORK_GOOD, new ƒ.AnimationNodeAnimation(this.work_good));

            this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_BUILD, this.work_build_offset);
            this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_BAD, this.work_bad_offset);
            this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_NORMAL, this.work_normal_offset);
            this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_GOOD, this.work_good_offset);

            this.animPlaying = new ƒ.AnimationNodeTransition(this.animations.get(this.activeAnimation));
            this.animOverlay = new ƒ.AnimationNodeTransition(this.animations.get(EumlingAnimator.ANIMATIONS.EMPTY));
            let rootAnim = new ƒ.AnimationNodeBlend([this.animPlaying, this.animOverlay]);
            this.cmpAnim = new ƒ.ComponentAnimationGraph(rootAnim);

            let importedScene = this.node.getChild(0);
            importedScene.getComponent(ƒ.ComponentAnimation).activate(false);
            importedScene.addComponent(this.cmpAnim);
        }

        public transitionToAnimation(_anim: EumlingAnimator.ANIMATIONS, _time: number = 300) {
            let anim = this.animations.get(_anim);
            if (!anim) return;
            this.animPlaying.transit(anim, _time);
            this.activeAnimation = _anim;
        }

        private timeout: ƒ.Timer = undefined;
        public overlayAnimation(_anim: EumlingAnimator.ANIMATIONS, _time: number = 100) {
            let anim = this.animations.get(_anim);
            if (!anim) return;
            this.animOverlay.transit(anim, _time);
            if (this.timeout !== undefined) {
                this.timeout.clear();
                this.timeout = undefined;
            }
            this.timeout = new ƒ.Timer(ƒ.Time.game, anim.animation.totalTime, 1, () => {
                this.timeout = undefined;
                this.animOverlay.transit(this.animations.get(EumlingAnimator.ANIMATIONS.EMPTY), 100);

            })
        }

        public getOffset(_anim: EumlingAnimator.ANIMATIONS): ƒ.Vector3 {
            return this.offsets.get(_anim) ?? ƒ.Vector3.ZERO();
        }
    }

    export namespace EumlingAnimator {
        export enum ANIMATIONS {
            EMPTY,
            IDLE,
            WALK,
            CLICKED_ON,
            PICKED,
            FALL,
            SIT,
            WORK_BUILD,
            WORK_BAD,
            WORK_NORMAL,
            WORK_GOOD,
        }
    }
}