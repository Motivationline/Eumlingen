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
        pressed: boolean;
        type: "mouse" | "touch";
    }
    enum EVENT_POINTER {
        /** A pointer enters the html element */
        START = "pointerstart",
        /** A pointer starts being pressed / touched */
        START_TOUCH = "pointerstarttouch",
        /** A pointer exits the html element */
        END = "pointerend",
        /** A pointer ends being pressed / touched */
        END_TOUCH = "pointerendtouch",
        /** A pointer changes, either its pressed/touched status or its position */
        CHANGE = "pointerchange"
    }
    interface UnifiedPointerEvent {
        pointer: Pointer;
    }
    class UnifiedPointerInput extends EventTarget {
        private pointers;
        private mouseId;
        initialize(_element: HTMLElement): void;
        private hndTap;
        private hndTapEnd;
        private hndMouseEnter;
        private hndMouseMove;
        private hndMouseLeave;
        private hndMouseDown;
        private hndMouseUp;
        private getPointer;
        private createPointerFromTouch;
        private createPointerFromMouse;
        get pointerList(): Pointer[];
    }
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    abstract class UpdateScriptComponent extends ƒ.Component {
        constructor();
        static updateAllInBranch(_branch: ƒ.Node): void;
        abstract start(): void;
        abstract update(): void;
    }
}
declare namespace Script {
    class EumlingMovement extends UpdateScriptComponent {
        constructor();
        start(): void;
        update(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentChangeMaterial extends ƒ.Component {
        static readonly iSubclass: number;
        changeMaterial: ƒ.Material;
        constructor();
        hndEvent: (_event: Event) => void;
        private switchMaterial;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    function findFirstCameraInGraph(_graph: ƒ.Node): ƒ.ComponentCamera;
}
