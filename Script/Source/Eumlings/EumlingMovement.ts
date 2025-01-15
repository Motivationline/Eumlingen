/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingMovement extends UpdateScriptComponent {
        private targetPosition: ƒ.Vector3;
        @ƒ.serialize(Boolean)
        removeWhenReached: boolean = true;
        @ƒ.serialize(Number)
        speed: number = 1;
        @ƒ.serialize(Number)
        idleTimeMSMin: number = 1000;
        @ƒ.serialize(Number)
        idleTimeMSMax: number = 5000;
        @ƒ.serialize(Number)
        sitTimeMSMin: number = 5000;
        @ƒ.serialize(Number)
        sitTimeMSMax: number = 10000;

        private state: STATE = STATE.IDLE;
        private animator: EumlingAnimator;
        private nextSwapTimestamp: number = 0;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        override start() {
            this.animator = this.node.getComponent(EumlingAnimator);
            this.nextSwapTimestamp = ƒ.Time.game.get() + this.idleTimeMSMin;
        };
        override update(_e: CustomEvent<UpdateEvent>) {
            let now = ƒ.Time.game.get();
            switch (this.state) {
                case STATE.IDLE:
                    {
                        if (now > this.nextSwapTimestamp) {
                            if (Math.random() < 0.3) {
                                this.state = STATE.SIT;
                                this.nextSwapTimestamp = now + this.sitTimeMSMin + Math.random() * (this.sitTimeMSMax - this.sitTimeMSMin);
                                this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.SIT, 100);
                            } else {
                                this.targetPosition = this.getPositionToWalkTo();
                                if (!this.targetPosition) break;
                                this.state = STATE.WALK;
                                let diff = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                                this.node.mtxLocal.lookIn(diff, ƒ.Vector3.Y(1));
                                this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WALK, 100);
                            }
                        }
                    }
                    break;
                case STATE.SIT:
                    {
                        if (now > this.nextSwapTimestamp) {
                            this.state = STATE.IDLE;
                            this.nextSwapTimestamp = now + this.idleTimeMSMin + Math.random() * (this.idleTimeMSMax - this.idleTimeMSMin);
                            this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.IDLE, 300);
                        }
                    }
                    break;
                case STATE.WALK:
                    {
                        if (!this.targetPosition.equals(this.node.mtxWorld.translation, this.speed * 2)) {
                            let difference = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                            difference.normalize((this.speed / 1000) * _e.detail.deltaTime);
                            this.node.mtxLocal.translate(difference, false);
                        } else {
                            if (this.removeWhenReached) {
                                this.targetPosition = undefined;
                            }
                            this.state = STATE.IDLE;
                            this.nextSwapTimestamp = now + this.idleTimeMSMin + Math.random() * (this.idleTimeMSMax - this.idleTimeMSMin);
                            this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.IDLE, 200);
                        }
                    }
                    break;
                case STATE.WORK:
                    break;
            }
        };

        private getPositionToWalkTo(): ƒ.Vector3 | undefined {
            let walkNode = this.node.getParent();
            if (!walkNode) return undefined;
            let wa = walkNode.getComponent(WalkableArea);
            if (!wa) return undefined;
            for (let i: number = 0; i < 10; i++) {
                let newPos = wa.getPositionInside();
                if (ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation).magnitudeSquared > 3) {
                    return newPos;
                }
            }
            return undefined;
        }

        public pickUp() {

        }
    }
    enum STATE {
        IDLE,
        SIT,
        WALK,
        WORK,
    }
}