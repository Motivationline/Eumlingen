namespace Script {
    import ƒ = FudgeCore;

    @ƒ.serialize
    export class PickSphere extends ƒ.Component {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(PickSphere);

        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }

        #radius: number = 1;
        #radiusSquared: number = 1;
        
        @ƒ.serialize(Number)
        get radius(): number {
            return this.#radius;
        }
        set radius(_r: number) {
            this.#radius = _r;
            this.#radiusSquared = _r * _r;
        }
        get radiusSquared(): number {
            return this.#radiusSquared;
        }
        
        @ƒ.serialize(ƒ.Vector3)
        offset: ƒ.Vector3 = new ƒ.Vector3();

        get mtxPick(): ƒ.Matrix4x4 {
            return this.node.mtxWorld.clone.translate(this.offset, true).scale(ƒ.Vector3.ONE(Math.max(this.radius * 2, 0.000001)));
        }

        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void {
            ƒ.Gizmos.drawWireSphere(this.mtxPick, ƒ.Color.CSS("red"));
        }

        /**
         * finds all pickSpheres within the given ray
         * @param ray the ray to check against
         * @param options options
         */
        static pick(ray: ƒ.Ray, options: Partial<PickSpherePickOptions> = {}): PickSphere[] {
            const picks: PickSphere[] = [];
            options = { ...this.defaultOptions, ...options };

            for (let node of options.branch) {
                let pckSph = node.getComponent(PickSphere);
                if (!pckSph) continue;
                let distance = ray.getDistance(pckSph.mtxPick.translation);
                if (distance.magnitudeSquared < pckSph.radiusSquared) {
                    picks.push(pckSph);
                }

            }

            if (options.sortBy) {
                let distances = new Map<PickSphere, number>();
                if (options.sortBy === "distanceToRayOrigin") {
                    picks.forEach(p => distances.set(p, ray.origin.getDistance(p.node.mtxWorld.translation)));
                } else if (options.sortBy === "distanceToRay") {
                    picks.forEach(p => distances.set(p, ray.getDistance(p.node.mtxWorld.translation).magnitudeSquared));
                }
                picks.sort((a, b) => distances.get(a) - distances.get(b));
            }

            return picks;
        }

        private static get defaultOptions(): PickSpherePickOptions {
            return {
                branch: viewport.getBranch(),
            }
        }
    }

    interface PickSpherePickOptions {
        /** Sets by what metric to sort the results. Unsorted if undefined */
        sortBy?: "distanceToRay" | "distanceToRayOrigin",
        branch: ƒ.Node
    }
}