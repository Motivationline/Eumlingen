namespace Script {
    import ƒ = FudgeCore;

    export function findFirstCameraInGraph(_graph: ƒ.Node): ƒ.ComponentCamera {
        let cam = _graph.getComponent(ƒ.ComponentCamera);
        if (cam) return cam;
        for (let child of _graph.getChildren()) {
            cam = findFirstCameraInGraph(child);
            if (cam) return cam;
        }
        return undefined;
    }


    export function randEnumValue<T extends object>(enumObj: T): T[keyof T] {
        const enumValues = Object.values(enumObj);
        const index = Math.floor(Math.random() * enumValues.length);

        return enumValues[index];
    }
}