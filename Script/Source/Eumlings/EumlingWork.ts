/// <reference path="../Plugins/UpdateScriptComponent.ts" />
namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class EumlingWork extends UpdateScriptComponent {
        private workbench: Workbench;
        private moveComp: EumlingMovement;
        start(_e: CustomEvent<UpdateEvent>): void {
            this.moveComp = this.node.getComponent(EumlingMovement);
        }
        update(_e: CustomEvent<UpdateEvent>): void {
            this.work(_e.detail.deltaTime);
        }

        public unassign() {
            this.workbench = undefined;
            this.moveComp.walkAway();
        }

        public assign(_wb: Workbench) {
            _wb.work(this.node, 0);
            this.workbench = _wb;
            this.moveComp.teleportTo(_wb.node.mtxWorld.translation);
            this.moveComp.setState(STATE.WORK);
        }

        public work(_timeMS: number) {
            if (!this.workbench) return;
            this.workbench.work(this.node, _timeMS);
        }
    }
}