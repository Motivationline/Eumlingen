/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingMovement extends UpdateScriptComponent {
        targetPosition: ƒ.Vector3;
        @ƒ.serialize(Boolean)
        removeWhenReached: boolean = true;
        @ƒ.serialize(Number)
        speed: number = 1;
        @ƒ.serialize(Number)
        avgIdleTimeSeconds: number = 0;

        private animator: EumlingAnimator;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        override start() {
            this.animator = this.node.getComponent(EumlingAnimator);
        };
        override update(_e: CustomEvent<UpdateEvent>) {
            if (this.targetPosition) {
                if (!this.targetPosition.equals(this.node.mtxWorld.translation, this.speed * 2)) {
                    let difference = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                    difference.normalize((this.speed / 1000) * _e.detail.deltaTime);
                    this.node.mtxLocal.translate(difference, false);
                } else {
                    if (this.removeWhenReached) {
                        this.targetPosition = undefined;
                    }
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.IDLE, 200);
                } 
            } else {
                const standingTime: number = this.avgIdleTimeSeconds * 1000;
                if (Math.random() * standingTime < _e.detail.deltaTime){
                    this.targetPosition = this.getPositionToWalkTo();
                    let diff = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                    this.node.mtxLocal.lookIn(diff, ƒ.Vector3.Y(1));
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WALK, 100);
                }
            }
            // console.log("update");
        };

        private getPositionToWalkTo(): ƒ.Vector3 | undefined {
            let walkNode = this.node.getParent();
            if (!walkNode) return undefined;
            let wa = walkNode.getComponent(WalkableArea);
            if (!wa) return undefined;
            return wa.getPositionInside();
        }

        public pickUp(){
            
        }
    }
}