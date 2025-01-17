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

    export function randomEnum<T extends object>(anEnum: T): T[keyof T] {
        const enumValues = Object.keys(anEnum)
            .map(n => Number.parseInt(n))
            .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
        const randomIndex = Math.floor(Math.random() * enumValues.length)
        const randomEnumValue = enumValues[randomIndex]
        return randomEnumValue;
    }
}