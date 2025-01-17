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
        ended?: boolean;
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
        private preventDefaults;
        get pointerList(): Pointer[];
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    const upInput: UnifiedPointerInput;
    let eumlingCameraActive: boolean;
    const gravity: number;
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
        pick: ƒ.Animation;
        fall: ƒ.Animation;
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
            PICKED = 4,
            FALL = 5,
            SIT = 6
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
        private showSelf;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class EumlingMovement extends UpdateScriptComponent implements Clickable {
        removeWhenReached: boolean;
        speed: number;
        idleTimeMSMin: number;
        idleTimeMSMax: number;
        sitTimeMSMin: number;
        sitTimeMSMax: number;
        private targetPosition;
        private state;
        private animator;
        private nextSwapTimestamp;
        private pointer;
        private walkArea;
        private velocity;
        static maxVelocity: number;
        constructor();
        start(): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        setState(_state: STATE): void;
        private getPositionToWalkTo;
        private findPickPosition;
        longTap(_pointer: Pointer): void;
        walkAway(): void;
        walkTo(_pos: ƒ.Vector3): void;
        teleportTo(_pos: ƒ.Vector3): void;
        stopMoving(): void;
    }
    enum STATE {
        IDLE = 0,
        FALL = 1,
        SIT = 2,
        WALK = 3,
        PICKED = 4,
        WORK = 5
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
    class EumlingWork extends UpdateScriptComponent {
        private workbench;
        private moveComp;
        start(_e: CustomEvent<UpdateEvent>): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        unassign(): void;
        assign(_wb: Workbench): void;
        work(_timeMS: number): void;
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
    import ƒ = FudgeCore;
    function findFrontPickedObject(_p: Pointer): ƒ.Node | undefined;
    function findAllPickedObjects(_pointer: Pointer): ƒ.Node[];
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
        get minX(): number;
        get maxX(): number;
        get Y(): number;
        get minZ(): number;
        get maxZ(): number;
        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    function findFirstCameraInGraph(_graph: ƒ.Node): ƒ.ComponentCamera;
    function randEnumValue<T extends object>(enumObj: T): T[keyof T];
}
declare namespace Script {
    import ƒ = FudgeCore;
    interface BaseCategory {
        img: string;
        name: string;
        id: number;
    }
    export interface Category extends BaseCategory {
        id: CATEGORY;
        subcategories: Subcategory[];
    }
    export interface Subcategory extends BaseCategory {
        id: SUBCATEGORY;
        preferredTraits: TRAIT[];
    }
    export enum CATEGORY {
        NATURE = 1,
        CRAFT = 2
    }
    export enum SUBCATEGORY {
        ANIMALS = 1,
        FARMING = 2,
        GARDENING = 3,
        MATERIAL_EXTRACTION = 4,
        PRODUCTION = 5,
        PROCESSING = 6
    }
    export class Workbench extends UpdateScriptComponent implements Clickable {
        static categories: Category[];
        private category;
        private subcategory;
        private buildProgress;
        private readonly buildSpeed;
        private assignee;
        private matColor;
        start(_e: CustomEvent<UpdateEvent>): void;
        shortTap(_pointer: Pointer): void;
        longTap(_pointer: Pointer): void;
        private displayWorkbenchInfo;
        private fillUpgradeOverlayWithInfo;
        private fillInfoOverlayWithInfo;
        private setCategory;
        private resetCategory;
        static getCategoryFromId(_id: CATEGORY): Category;
        static getSubcategoryFromId(_id: SUBCATEGORY): Subcategory;
        work(_eumling: ƒ.Node, _timeMS: number): void;
        unassignEumling(): void;
    }
    export {};
}
