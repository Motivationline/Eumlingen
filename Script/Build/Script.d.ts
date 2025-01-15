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
        start?(_e: CustomEvent<UpdateEvent>): void;
        update?(_e: CustomEvent<UpdateEvent>): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class EumlingAnimator extends UpdateScriptComponent {
        idle: ƒ.Animation;
        walk: ƒ.Animation;
        clickedOn: ƒ.Animation;
        sit: ƒ.Animation;
        activeAnimation: EumlingAnimator.ANIMATIONS;
        private animations;
        private animPlaying;
        private animOverlay;
        private cmpAnim;
        start(_e: CustomEvent<UpdateEvent>): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        transitionToAnimation(_anim: EumlingAnimator.ANIMATIONS, _time?: number): void;
        private timeout;
        overlayAnimation(_anim: EumlingAnimator.ANIMATIONS, _time?: number): void;
    }
    namespace EumlingAnimator {
        enum ANIMATIONS {
            EMPTY = 0,
            IDLE = 1,
            WALK = 2,
            CLICKED_ON = 3,
            SIT = 4
        }
    }
}
declare namespace Script {
    class EumlingData extends UpdateScriptComponent implements Clickable {
        static names: string[];
        name: string;
        traits: Set<TRAIT>;
        start(_e: CustomEvent<UpdateEvent>): void;
        shortTap(_pointer: Pointer): void;
        longTap(_pointer: Pointer): void;
        private showSelf;
    }
}
declare namespace Script {
    class EumlingMovement extends UpdateScriptComponent {
        private targetPosition;
        removeWhenReached: boolean;
        speed: number;
        idleTimeMSMin: number;
        idleTimeMSMax: number;
        sitTimeMSMin: number;
        sitTimeMSMax: number;
        private state;
        private animator;
        private nextSwapTimestamp;
        constructor();
        start(): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        private getPositionToWalkTo;
        pickUp(): void;
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
    enum TRAIT {
        ANIMAL_LOVER = 0,
        SOCIAL = 1,
        NATURE_CONNECTION = 2,
        ORGANIZED = 3,
        ARTISTIC = 4,
        BODY_STRENGTH = 5,
        FINE_MOTOR_SKILLS = 6,
        PATIENCE = 7
    }
}
declare namespace Script {
    interface Clickable {
        shortTap?(_pointer: Pointer): void;
        longTap?(_pointer: Pointer): void;
    }
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
    export function showLayer(_layer: HTMLElement, _options?: Partial<LayerOptions>): void;
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
    function randEnumValue<T extends object>(enumObj: T): T[keyof T];
}
declare namespace Script {
    interface Category {
        id: CATEGORY;
        subcategories: Subcategory[];
    }
    interface Subcategory {
        id: SUBCATEGORY;
        preferredTraits: TRAIT[];
    }
    enum CATEGORY {
        NATURE = 0,
        CRAFT = 1
    }
    enum SUBCATEGORY {
        ANIMALS = 0,
        FARMING = 1,
        GARDENING = 2,
        MATERIAL_EXTRACTION = 3,
        PRODUCTION = 4,
        PROCESSING = 5
    }
    class Workbench extends UpdateScriptComponent implements Clickable {
        static categories: Category[];
        private category;
        private subcategory;
        shortTap(_pointer: Pointer): void;
        longTap(_pointer: Pointer): void;
        displayWorkbenchInfo(): void;
    }
}
