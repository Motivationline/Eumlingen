namespace Script {
    import ƒ = FudgeCore;
    export class EumlingSpawner extends UpdateScriptComponent {
        private eumling: ƒ.Graph;
        private eumlingAmount: number = 0;
        start(_e: CustomEvent<UpdateEvent>): void {
            this.node.addEventListener("spawnEumling", this.spawn, true);
            this.eumling = <ƒ.Graph>ƒ.Project.getResourcesByName("Eumling")[0];
        }
        spawn = async () => {
            console.log("spawn eumling");
            let wa = this.node.getComponent(WalkableArea);
            if (!wa) return;
            let newPos = wa.getPositionInside();
            let instance = await ƒ.Project.createGraphInstance(this.eumling);

            if(this.eumlingAmount === 0){
                newPos = new ƒ.Vector3(-7, 0, 0)
            }
            instance.mtxLocal.translation = ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation);
            this.node.appendChild(instance);
            this.eumlingAmount++;
        }

    }
}