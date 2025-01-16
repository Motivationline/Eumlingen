/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingMovement extends UpdateScriptComponent implements Clickable {
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

        private targetPosition: ƒ.Vector3;
        private state: STATE = STATE.IDLE;
        private animator: EumlingAnimator;
        private nextSwapTimestamp: number = 0;
        private pointer: Pointer;
        private walkArea: WalkableArea;
        private fallSpeed: number = 0;

        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        override start() {
            this.animator = this.node.getComponent(EumlingAnimator);
            this.nextSwapTimestamp = ƒ.Time.game.get() + this.idleTimeMSMin;

            let walkNode = this.node.getParent();
            this.walkArea = walkNode?.getComponent(WalkableArea);
        };
        override update(_e: CustomEvent<UpdateEvent>) {
            let now = ƒ.Time.game.get();
            switch (this.state) {
                case STATE.IDLE:
                    {
                        if (now > this.nextSwapTimestamp) {
                            if (Math.random() < 0.3) {
                                this.setState(STATE.SIT);
                                this.nextSwapTimestamp = now + this.sitTimeMSMin + Math.random() * (this.sitTimeMSMax - this.sitTimeMSMin);
                            } else {
                                this.targetPosition = this.getPositionToWalkTo();
                                if (!this.targetPosition) break;
                                this.setState(STATE.WALK);
                            }
                        }
                    }
                    break;
                case STATE.SIT:
                    {
                        if (now > this.nextSwapTimestamp) {
                            this.setState(STATE.IDLE);
                            this.nextSwapTimestamp = now + this.idleTimeMSMin + Math.random() * (this.idleTimeMSMax - this.idleTimeMSMin);
                        }
                    }
                    break;
                case STATE.WALK:
                    {
                        if (!this.targetPosition.equals(this.node.mtxWorld.translation, this.speed * 2)) {
                            let difference = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                            difference.normalize((this.speed / 1000) * _e.detail.deltaTime);
                            this.node.mtxLocal.translate(difference, false);
                            this.node.mtxLocal.lookIn(difference, ƒ.Vector3.Y(1));
                        } else {
                            if (this.removeWhenReached) {
                                this.targetPosition = undefined;
                            }
                            this.setState(STATE.IDLE);
                            this.nextSwapTimestamp = now + this.idleTimeMSMin + Math.random() * (this.idleTimeMSMax - this.idleTimeMSMin);
                        }
                    }
                    break;
                case STATE.WORK:
                    break;
                case STATE.PICKED:
                    {
                        this.node.mtxLocal.lookIn(viewport.camera.mtxWorld.translation, ƒ.Vector3.Y(1));
                        let newPos = this.findPickPosition();
                        this.node.mtxLocal.translation = (ƒ.Vector3.SUM(this.node.mtxLocal.translation, ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation)));
                        if (this.pointer.ended) {
                            this.setState(STATE.FALL);
                            let pointer = this.pointer;
                            this.pointer = undefined;

                            //check if dropped over workbench
                            let pickedNodes = findAllPickedObjects(pointer);
                            let wb = pickedNodes.find(n => !!n.getComponent(Workbench))
                            if (!wb) break;
                            this.node.getComponent(EumlingWork).assign(wb.getComponent(Workbench));
                        }
                    }
                    break;
                case STATE.FALL:
                    {
                        this.fallSpeed += gravity * _e.detail.deltaTime / 1000;
                        this.node.mtxLocal.translateY(-this.fallSpeed);
                        if (this.node.mtxLocal.translation.y < 0) {
                            this.node.mtxLocal.translateY(0 - this.node.mtxLocal.translation.y);
                            this.fallSpeed = 0;
                            this.setState(STATE.IDLE);
                        }
                    }
                    break;
            }
        };

        setState(_state: STATE) {
            console.log("state change", this.state, "to", _state);
            this.state = _state;
            switch (_state) {
                case STATE.IDLE:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.IDLE, 300);
                    break;
                case STATE.FALL:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.FALL, 300);
                    break;
                case STATE.SIT:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.SIT, 100);
                    break;
                case STATE.WALK:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WALK, 100);
                    break;
                case STATE.PICKED:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.PICKED, 100);
                    break;
                case STATE.WORK:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.IDLE, 100);
                    break;
            }
        }

        private getPositionToWalkTo(): ƒ.Vector3 | undefined {
            for (let i: number = 0; i < 10; i++) {
                let newPos = this.walkArea.getPositionInside();
                if (ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation).magnitudeSquared > 3) {
                    return newPos;
                }
            }
            return undefined;
        }

        private findPickPosition(): ƒ.Vector3 {
            const ray = viewport.getRayFromClient(new ƒ.Vector2(this.pointer.currentX, this.pointer.currentY));
            const planePos = new ƒ.Vector3(this.walkArea.minX, this.walkArea.Y, this.walkArea.maxZ);
            let pos = ray.intersectPlane(planePos, ƒ.Vector3.Z(1));

            // clean up pos to stay inside walkable area

            pos.x = Math.max(this.walkArea.minX, Math.min(this.walkArea.maxX, pos.x));
            pos.y = Math.max(this.walkArea.Y, pos.y - this.node.radius * 0.8);
            pos.z = Math.max(this.walkArea.minZ, Math.min(this.walkArea.maxZ, pos.z));

            return pos;
        }

        longTap(_pointer: Pointer): void {
            this.setState(STATE.PICKED);
            this.pointer = _pointer;
        }

        walkAway() {
            this.targetPosition = this.getPositionToWalkTo();
            if (!this.targetPosition) this.walkAway(); //dangerous but probably not an issue
            this.setState(STATE.WALK);
        }

        walkTo(_pos: ƒ.Vector3) {
            this.targetPosition = ƒ.Vector3.DIFFERENCE(_pos, this.walkArea.node.mtxWorld.translation);
            this.setState(STATE.WALK);
        }

        teleportTo(_pos: ƒ.Vector3) {
            this.node.mtxLocal.translate(ƒ.Vector3.DIFFERENCE(_pos, this.node.mtxWorld.translation), false);
        }
    }
    export enum STATE {
        IDLE,
        FALL,
        SIT,
        WALK,
        PICKED,
        WORK,
    }
}