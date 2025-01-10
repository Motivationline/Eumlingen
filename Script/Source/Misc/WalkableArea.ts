namespace Script {
    import ƒ = FudgeCore;
    @ƒ.serialize
    export class WalkableArea extends ƒ.Component {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(WalkableArea);

        @ƒ.serialize(Number)
        width: number = 1;
        @ƒ.serialize(Number)
        depth: number = 1;

        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

        }

        public getPositionInside(): ƒ.Vector3 {
            return ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(this.width * Math.random(), 0, this.depth * Math.random()))
        }


        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void {
            const corners = [
                this.node.mtxWorld.translation,
                ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(this.width, 0, 0)),
                ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(this.width, 0, this.depth)),
                ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(0, 0, this.depth)),
            ];
            ƒ.Gizmos.drawLines([corners[0], corners[1], corners[1], corners[2], corners[2], corners[3], corners[3], corners[0]], ƒ.Matrix4x4.IDENTITY(), ƒ.Color.CSS("blue"));
        }
    }
}