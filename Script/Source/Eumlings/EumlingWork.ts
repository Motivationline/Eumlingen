/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingWork extends UpdateScriptComponent {
        private workbench: Workbench;
        private moveComp: EumlingMovement;
        private animator: EumlingAnimator;
        start(_e: CustomEvent<UpdateEvent>): void {
            this.moveComp = this.node.getComponent(EumlingMovement);
            this.animator = this.node.getComponent(EumlingAnimator);
        }
        update(_e: CustomEvent<UpdateEvent>): void {
            this.work(_e.detail.deltaTime);
        }

        public unassign() {
            if(!this.workbench) return;
            let wb = this.workbench;
            this.workbench = undefined;
            wb.unassignEumling();
            this.moveComp.walkAway();
        }

        public assign(_wb: Workbench) {
            let fittingTraits = _wb.work(this.node, 0);
            this.workbench = _wb;
            this.moveComp.teleportTo(_wb.node.mtxWorld.translation);
            this.moveComp.setState(STATE.WORK);
            this.updateWorkAnimation(fittingTraits);
        }
        
        public updateWorkAnimation(_fittingTraits: number) {
            if(this.workbench.needsAssembly){
                this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WORK_BUILD, 100);
            }
            else if(_fittingTraits === 0){
                this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WORK_BAD, 100);
            }
            else if(_fittingTraits === 1){
                this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WORK_NORMAL, 100);
            }
            else if(_fittingTraits === 2){
                this.animator.transitionToAnimation(EumlingAnimator.ANIMATIONS.WORK_GOOD, 100);
            }
        }

        public work(_timeMS: number) {
            if (!this.workbench) return;
            this.workbench.work(this.node, _timeMS);
        }
    }
}