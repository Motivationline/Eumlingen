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
        private state: STATE = STATE.GROWN;
        private animator: EumlingAnimator;
        private nextSwapTimestamp: number = 0;
        private pointer: Pointer;
        private walkArea: WalkableArea;
        private velocity: ƒ.Vector3 = new ƒ.Vector3();
        private pick: PickSphere;

        static maxVelocity: number = 10;

        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        override start() {
            this.animator = this.node.getComponent(EumlingAnimator);

            let walkNode = this.node.getParent();
            this.walkArea = walkNode?.getComponent(WalkableArea);
            this.pick = this.node.getComponent(PickSphere);

            this.setState(this.state);
        };
        override update(_e: CustomEvent<UpdateEvent>) {
            if (eumlingCameraActive) return;
            let now = ƒ.Time.game.get();
            let deltaTimeSeconds: number = _e.detail.deltaTime / 1000;
            switch (this.state) {
                case STATE.IDLE:
                    {
                        if (now > this.nextSwapTimestamp) {
                            if (Math.random() < 0.3) {
                                this.setState(STATE.SIT);
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
                        }
                    }
                    break;
                case STATE.WALK:
                    {
                        if (!this.targetPosition.equals(this.node.mtxWorld.translation, this.speed * 2)) {
                            let difference = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                            let prevDistance = difference.magnitudeSquared;
                            difference.normalize((this.speed / 1000) * _e.detail.deltaTime);
                            if (prevDistance > difference.magnitudeSquared) {
                                this.node.mtxLocal.translate(difference, false);
                            }
                            this.node.mtxLocal.lookIn(difference, ƒ.Vector3.Y(1));
                        } else {
                            if (this.removeWhenReached) {
                                this.targetPosition = undefined;
                            }
                            this.setState(STATE.IDLE);
                        }
                    }
                    break;
                case STATE.WORK:
                    break;
                case STATE.PICKED:
                    {
                        let viewDirection = ƒ.Vector3.DIFFERENCE(viewport.camera.mtxWorld.translation, this.node.mtxWorld.translation);
                        this.node.mtxLocal.lookIn(viewDirection, ƒ.Vector3.Y(1));
                        let newPos = this.findPickPosition();
                        let difference = ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation);
                        this.node.mtxLocal.translate(difference, false);
                        this.velocity.set(difference.x / deltaTimeSeconds, difference.y / deltaTimeSeconds, 0);
                        if (this.pointer.ended) {
                            this.setState(STATE.FALL);
                            if (this.velocity.magnitudeSquared > EumlingMovement.maxVelocity * EumlingMovement.maxVelocity)
                                this.velocity.normalize(EumlingMovement.maxVelocity);
                            let pointer = this.pointer;
                            this.pointer = undefined;

                            //check if dropped over workbench
                            let pickedNodes = findAllPickedObjectsUsingPickSphere(pointer);
                            let wb = pickedNodes.find(n => !!n.getComponent(Workbench))
                            if (!wb) break;
                            this.node.getComponent(EumlingWork).assign(wb.getComponent(Workbench));
                        }
                    }
                    break;
                case STATE.FALL:
                    {
                        this.velocity.y -= gravity * deltaTimeSeconds;
                        if (this.node.mtxWorld.translation.x + this.velocity.x * deltaTimeSeconds < this.walkArea.minX ||
                            this.node.mtxWorld.translation.x + this.velocity.x * deltaTimeSeconds > this.walkArea.maxX) {
                            this.velocity.x = 0;
                        }
                        this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.velocity, deltaTimeSeconds), false);
                        if (this.node.mtxLocal.translation.y < 0) {
                            this.node.mtxLocal.translateY(0 - this.node.mtxLocal.translation.y);
                            this.velocity.set(0, 0, 0);
                            this.setState(STATE.IDLE);
                        }
                    }
                    break;
            }
        };

        setState(_state: STATE) {
            let now = ƒ.Time.game.get();
            switch (_state) {
                case STATE.IDLE:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.IDLE, 300);
                    this.nextSwapTimestamp = now + this.idleTimeMSMin + Math.random() * (this.idleTimeMSMax - this.idleTimeMSMin);
                    break;
                case STATE.FALL:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.FALL, 300);
                    break;
                case STATE.SIT:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.SIT, 100);
                    this.nextSwapTimestamp = now + this.sitTimeMSMin + Math.random() * (this.sitTimeMSMax - this.sitTimeMSMin);
                    break;
                case STATE.WALK:
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WALK, 100);
                    break;
                case STATE.PICKED:
                    if (this.state === STATE.WORK) {
                        this.node.getComponent(EumlingWork).unassign();
                    }
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.PICKED, 100);
                    break;
                case STATE.WORK:
                    break;
                case STATE.GROWN:
                    this.node.mtxLocal.translateY(-0.95);
                    this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.PICKED, 100);
                    this.pick.offset.y = 1.20;
                    this.pick.radius = 0.3;
                    break;
            }

            this.state = _state;
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
            pos.y = Math.max(this.walkArea.Y, pos.y - this.node.radius * 0.62);
            pos.z = Math.max(this.walkArea.minZ, Math.min(this.walkArea.maxZ, pos.z));

            return pos;
        }

        shortTap(_pointer: Pointer): void {
            if (this.state === STATE.GROWN) {
                this.node.mtxLocal.translateY(-this.node.mtxLocal.translation.y);
                this.setState(STATE.IDLE);
                this.pick.offset.y = 0.45;
                this.pick.radius = 0.4;
                _pointer.used = true;
                return;
            }
        }

        longTap(_pointer: Pointer): void {
            if (this.state === STATE.GROWN) {
                this.node.mtxLocal.translateY(-this.node.mtxLocal.translation.y);
                this.setState(STATE.IDLE);
                return;
            }
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

        teleportTo(_pos: ƒ.Vector3, _rot?: ƒ.Vector3) {
            this.node.mtxLocal.translate(ƒ.Vector3.DIFFERENCE(_pos, this.node.mtxWorld.translation), false);
            if(_rot)
                this.node.mtxLocal.rotate(ƒ.Vector3.DIFFERENCE(_rot, this.node.mtxWorld.rotation), false);
        }
        teleportBy(_dif: ƒ.Vector3, _local?: boolean) {
            this.node.mtxLocal.translate(_dif, _local);
        }

        stopMoving() {
            if (this.state === STATE.WALK) {
                this.setState(STATE.IDLE);
            }
            this.animator.overlayAnimation(EumlingAnimator.ANIMATIONS.CLICKED_ON);
        }

        getState(): STATE {
            return this.state;
        }
    }
    export enum STATE {
        IDLE,
        FALL,
        SIT,
        WALK,
        PICKED,
        WORK,
        GROWN,
    }
}