/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingWork extends UpdateScriptComponent {
        private workbench: Workbench;
        private moveComp: EumlingMovement;
        private animator: EumlingAnimator;
        private totalWorkTime: number = 0;
        start(_e: CustomEvent<UpdateEvent>): void {
            this.moveComp = this.node.getComponent(EumlingMovement);
            this.animator = this.node.getComponent(EumlingAnimator);
        }
        update(_e: CustomEvent<UpdateEvent>): void {
            this.work(_e.detail.deltaTime);
        }

        public unassign() {
            if (!this.workbench) return;
            let wb = this.workbench;
            this.workbench = undefined;
            wb.unassignEumling();
            this.moveComp.walkAway();
        }

        public assign(_wb: Workbench) {
            let fittingTraits = _wb.work(this.node, 0);
            this.workbench = _wb;
            const anim = this.getWorkAnimation(fittingTraits);
            this.moveComp.teleportTo(_wb.node.mtxWorld.translation, _wb.node.mtxWorld.rotation);
            this.moveComp.teleportBy(this.animator.getOffset(anim), true);
            this.moveComp.setState(STATE.WORK);
            this.updateWorkAnimation(anim);
        }

        public getWorkAnimation(_fittingTraits: number): EumlingAnimator.ANIMATIONS {
            if (this.workbench.needsAssembly) {
                return EumlingAnimator.ANIMATIONS.WORK_BUILD;
            }
            else if (_fittingTraits === 0) {
                return EumlingAnimator.ANIMATIONS.WORK_BAD;
            }
            else if (_fittingTraits === 1) {
                return EumlingAnimator.ANIMATIONS.WORK_NORMAL;
            }
            else if (_fittingTraits === 2) {
                return EumlingAnimator.ANIMATIONS.WORK_GOOD;
            }
            return EumlingAnimator.ANIMATIONS.WORK_GOOD;
        }

        public updateWorkAnimation(_anim: EumlingAnimator.ANIMATIONS) {
            this.animator.transitionToAnimation(_anim, 100);
        }

        public work(_timeMS: number) {
            if (!this.workbench) return;
            this.workbench.work(this.node, _timeMS);
            this.totalWorkTime += _timeMS;
            globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "eumlingWorking", data: { workTime: this.totalWorkTime } } }));
        }
    }
}