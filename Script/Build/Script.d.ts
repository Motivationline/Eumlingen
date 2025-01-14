declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    interface Pointer {
        id: number;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
        startTime: number;
        type: string;
        longTapTimeout: number;
        short: boolean;
        used?: boolean;
    }
    enum EVENT_POINTER {
        /** A pointer enters the html element */
        START = "pointerstart",
        /** A pointer exits the html element */
        END = "pointerend",
        /** A pointer changes, either its pressed/touched status or its position */
        CHANGE = "pointerchange",
        /** A pointer is pressed and released faster than the threshold for a long tap */
        SHORT = "pointershort",
        /** A pointer is pressed/touched for a longer time. */
        LONG = "pointerlong"
    }
    interface UnifiedPointerEvent {
        pointer: Pointer;
    }
    class UnifiedPointerInput extends EventTarget {
        private pointers;
        initialize(_element: HTMLElement): void;
        private hndPointerDown;
        private hndPointerUp;
        private hndPointerMove;
        private getPointer;
        private createPointerFromPointer;
        get pointerList(): Pointer[];
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    const upInput: UnifiedPointerInput;
    let eumlingCameraActive: boolean;
    const eumlingCamera: ƒ.ComponentCamera;
    const eumlingViewport: ƒ.Viewport;
}
declare namespace Script {
    import ƒ = FudgeCore;
    interface UpdateEvent {
        deltaTime: number;
    }
    abstract class UpdateScriptComponent extends ƒ.Component {
        constructor();
        static updateAllInBranch(_branch: ƒ.Node): void;
        abstract start(_e: CustomEvent<UpdateEvent>): void;
        abstract update(_e: CustomEvent<UpdateEvent>): void;
    }
}
declare namespace Script {
    class EumlingData extends UpdateScriptComponent {
        static names: string[];
        name: string;
        start(_e: CustomEvent<UpdateEvent>): void;
        update(_e: CustomEvent<UpdateEvent>): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class EumlingMovement extends UpdateScriptComponent {
        targetPosition: ƒ.Vector3;
        removeWhenReached: boolean;
        speed: number;
        avgIdleTimeSeconds: number;
        constructor();
        start(): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        private getPositionToWalkTo;
    }
}
declare namespace Script {
    class EumlingSpawner extends UpdateScriptComponent {
        private eumling;
        start(_e: CustomEvent<UpdateEvent>): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        spawn: () => Promise<void>;
    }
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentChangeMaterial extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        changeMaterial: ƒ.Material;
        constructor();
        hndEvent: (_event: Event) => void;
        private switchMaterial;
    }
}
declare namespace Script {
    interface LayerOptions {
        onAdd: (_element: HTMLElement) => void;
        onRemove: (_element: HTMLElement) => void;
    }
    export function showLayer(_layer: HTMLElement, _options: Partial<LayerOptions>): void;
    export function removeTopLayer(): void;
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class WalkableArea extends ƒ.Component {
        static readonly iSubclass: number;
        width: number;
        depth: number;
        constructor();
        getPositionInside(): ƒ.Vector3;
        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    function findFirstCameraInGraph(_graph: ƒ.Node): ƒ.ComponentCamera;
}
