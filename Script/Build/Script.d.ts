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
        tapType: "none" | "short" | "long" | "drag";
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
    const globalEvents: EventTarget;
    const eumlingCamera: ƒ.ComponentCamera;
    const eumlingViewport: ƒ.Viewport;
    function checkScreenSides(_pointers: Pointer[]): void;
}
declare namespace Script {
    import ƒ = FudgeCore;
    export function findFirstCameraInGraph(_graph: ƒ.Node): ƒ.ComponentCamera;
    export function enumToArray<T extends object>(anEnum: T): T[keyof T][];
    export function randomEnum<T extends object>(anEnum: T): T[keyof T];
    export function mobileOrTabletCheck(): boolean;
    interface CreateElementAdvancedOptions {
        classes: string[];
        id: string;
        innerHTML: string;
        attributes: [string, string][];
    }
    export function createElementAdvanced<K extends keyof HTMLElementTagNameMap>(_type: K, _options?: Partial<CreateElementAdvancedOptions>): HTMLElementTagNameMap[K];
    export function shuffleArray<T>(_array: Array<T>): Array<T>;
    export function waitMS(_ms: number): Promise<void>;
    export function randomArrayElement<T>(_array: Array<T>): T | undefined;
    export function randomRange(min?: number, max?: number): number;
    export function randomString(length: number): string;
    export function capitalize(s: string): string;
    export {};
}
declare namespace Script {
    export type Setting = SettingCategory | SettingNumber | SettingString;
    interface SettingsBase {
        type: string;
        name: string;
    }
    export interface SettingCategory extends SettingsBase {
        type: "category";
        settings: Setting[];
    }
    export interface SettingString extends SettingsBase {
        type: "string";
        value: string;
    }
    export interface SettingNumber extends SettingsBase {
        type: "number";
        value: number;
        min: number;
        max: number;
        step: number;
    }
    export class Settings {
        private static settings;
        static proxySetting<T extends Setting>(_setting: T, onValueChange: (_old: any, _new: any) => void): T;
        static addSettings(..._settings: Setting[]): void;
        static generateHTML(_settings?: Setting[]): HTMLElement;
        private static generateSingleHTML;
        private static generateStringInput;
        private static generateNumberInput;
    }
    export {};
}
declare namespace Script {
    enum AUDIO_CHANNEL {
        MASTER = 0,
        EUMLING = 1,
        ENVIRONMENT = 2
    }
    class AudioManager {
        private static Instance;
        private gainNodes;
        private constructor();
        static addAudioCmpToChannel(_cmpAudio: ComponentAudioMixed, _channel: AUDIO_CHANNEL): void;
        static setChannelVolume(_channel: AUDIO_CHANNEL, _volume: number): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentAudioMixed extends ƒ.ComponentAudio {
        #private;
        static readonly iSubclass: number;
        private gainTarget;
        private isConnected;
        constructor(_audio?: ƒ.Audio, _loop?: boolean, _start?: boolean, _audioManager?: ƒ.AudioManager, _channel?: AUDIO_CHANNEL);
        get channel(): AUDIO_CHANNEL;
        set channel(_channel: AUDIO_CHANNEL);
        setGainTarget(node: AudioNode): void;
        connect(_on: boolean): void;
        drawGizmos(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    interface UpdateEvent {
        deltaTime: number;
    }
    abstract class UpdateScriptComponent extends ƒ.Component {
        constructor();
        static updateAllInBranch(_branch: ƒ.Node): void;
        prestart?(_e: CustomEvent<UpdateEvent>): void;
        start?(_e: CustomEvent<UpdateEvent>): void;
        update?(_e: CustomEvent<UpdateEvent>): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    abstract class SoundEmitter extends UpdateScriptComponent {
        #private;
        static readonly iSubclass: number;
        protected singleton: boolean;
        volume: number;
        local: boolean;
        addRandomness: boolean;
        channel: AUDIO_CHANNEL;
        mtxPivot: ƒ.Matrix4x4;
        boxSize: ƒ.Vector3;
        surfaceOfBoxOnly: boolean;
        s0: ƒ.Audio;
        s1: ƒ.Audio;
        s2: ƒ.Audio;
        s3: ƒ.Audio;
        s4: ƒ.Audio;
        s5: ƒ.Audio;
        s6: ƒ.Audio;
        s7: ƒ.Audio;
        s8: ƒ.Audio;
        s9: ƒ.Audio;
        s10: ƒ.Audio;
        s11: ƒ.Audio;
        s12: ƒ.Audio;
        s13: ƒ.Audio;
        s14: ƒ.Audio;
        s15: ƒ.Audio;
        s16: ƒ.Audio;
        s17: ƒ.Audio;
        s18: ƒ.Audio;
        s19: ƒ.Audio;
        start(_e: CustomEvent<UpdateEvent>): void;
        playRandomSound: () => void;
        private getTranslation;
        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void;
    }
    class SoundEmitterInterval extends SoundEmitter {
        static readonly iSubclass: number;
        minWaitTimeMS: number;
        maxWaitTimeMS: number;
        start(_e: CustomEvent<UpdateEvent>): void;
        private startTimer;
    }
    class SoundEmitterOnEvent extends SoundEmitter {
        static readonly iSubclass: number;
        event: string;
        start(_e: CustomEvent<UpdateEvent>): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class EumlingAnimator extends UpdateScriptComponent {
        idle: ƒ.Animation;
        walk: ƒ.Animation;
        clickedOn: ƒ.Animation;
        sit: ƒ.Animation;
        sitting: ƒ.Animation;
        lie_down: ƒ.Animation;
        lying_down: ƒ.Animation;
        pick: ƒ.Animation;
        fall: ƒ.Animation;
        work_build: ƒ.Animation;
        work_build_offset: ƒ.Vector3;
        work_bad: ƒ.Animation;
        work_bad_offset: ƒ.Vector3;
        work_normal: ƒ.Animation;
        work_normal_offset: ƒ.Vector3;
        work_good: ƒ.Animation;
        work_good_offset: ƒ.Vector3;
        activeAnimation: EumlingAnimator.ANIMATIONS;
        private animations;
        private offsets;
        private animPlaying;
        private animOverlay;
        private cmpAnim;
        prestart(_e: CustomEvent<UpdateEvent>): void;
        private timeoutTransition;
        transitionToAnimation(_anim: EumlingAnimator.ANIMATIONS, _time?: number, _animToPlayIfFirstEnds?: EumlingAnimator.ANIMATIONS): void;
        private timeoutOverlay;
        overlayAnimation(_anim: EumlingAnimator.ANIMATIONS, _time?: number): void;
        getOffset(_anim: EumlingAnimator.ANIMATIONS): ƒ.Vector3;
        private setupEvents;
    }
    namespace EumlingAnimator {
        enum ANIMATIONS {
            EMPTY = 0,
            IDLE = 1,
            WALK = 2,
            CLICKED_ON = 3,
            PICKED = 4,
            FALL = 5,
            SIT = 6,
            SITTING = 7,
            LIE_DOWN = 8,
            LYING_DOWN = 9,
            WORK_BUILD = 10,
            WORK_BAD = 11,
            WORK_NORMAL = 12,
            WORK_GOOD = 13
        }
    }
}
declare namespace Script {
    export enum TRAIT {
        ANIMAL_LOVER = 0,
        SOCIAL = 1,
        NATURE_CONNECTION = 2,
        ORGANIZED = 3,
        ARTISTIC = 4,
        BODY_STRENGTH = 5,
        FINE_MOTOR_SKILLS = 6,
        PATIENCE = 7
    }
    interface TraitData {
        name: string;
        image: string;
    }
    export const traitInfo: Map<TRAIT, TraitData>;
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class EumlingData extends UpdateScriptComponent implements Clickable {
        #private;
        static names: string[];
        traits: Set<TRAIT>;
        nameDisplay: ƒ.ComponentText;
        start(_e: CustomEvent<UpdateEvent>): void;
        get name(): string;
        set name(_name: string);
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
        private pick;
        static maxVelocity: number;
        constructor();
        start(): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        setState(_state: STATE): void;
        private getPositionToWalkTo;
        private findPickPosition;
        shortTap(_pointer: Pointer): void;
        longTap(_pointer: Pointer): void;
        private transitionOutOfGrown;
        walkAway(): void;
        walkTo(_pos: ƒ.Vector3): void;
        teleportTo(_pos: ƒ.Vector3, _rot?: ƒ.Vector3): void;
        teleportBy(_dif: ƒ.Vector3, _local?: boolean): void;
        stopMoving(): void;
        getState(): STATE;
    }
    enum STATE {
        IDLE = 0,
        FALL = 1,
        SIT = 2,
        WALK = 3,
        PICKED = 4,
        WORK = 5,
        GROWN = 6
    }
}
declare namespace Script {
    class EumlingSpawner extends UpdateScriptComponent {
        private eumling;
        private eumlingAmount;
        start(_e: CustomEvent<UpdateEvent>): void;
        spawn: () => Promise<void>;
    }
}
declare namespace Script {
    class EumlingWork extends UpdateScriptComponent {
        private workbench;
        private moveComp;
        private animator;
        private totalWorkTime;
        start(_e: CustomEvent<UpdateEvent>): void;
        update(_e: CustomEvent<UpdateEvent>): void;
        unassign(): void;
        assign(_wb: Workbench): void;
        getWorkAnimation(_fittingTraits: number): EumlingAnimator.ANIMATIONS;
        updateWorkAnimation(_anim: EumlingAnimator.ANIMATIONS): void;
        work(_timeMS: number): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    export type GlobalEventData = GlobalEventEumlingWorking | GlobalEventEumlingWorkingAtWorkbench | GlobalEventEumlingDevelopTrait | GlobalEventEumlingAssign | GlobalEventEumlingUnassign | GlobalEventDeconstructWorkbech | GlobalEventClickStatue | GlobalEventThrownEumlingTop;
    interface GlobalEventBase {
        type: string;
        data: any;
    }
    interface GlobalEventEumlingWorking extends GlobalEventBase {
        type: "eumlingWorking";
        data: {
            workTime: number;
        };
    }
    interface GlobalEventEumlingWorkingAtWorkbench extends GlobalEventBase {
        type: "eumlingWorkingAtWorkbench";
        data: {
            workTime: number;
        };
    }
    interface GlobalEventEumlingDevelopTrait extends GlobalEventBase {
        type: "eumlingDevelopTrait";
        data: {
            fittingTraits: number;
            traits: Set<TRAIT>;
            eumling: ƒ.Node;
        };
    }
    interface GlobalEventEumlingAssign extends GlobalEventBase {
        type: "assignEumling";
        data: {
            fittingTraits: number;
        };
    }
    interface GlobalEventEumlingUnassign extends GlobalEventBase {
        type: "unassignEumling";
        data: {
            workTime: number;
        };
    }
    interface GlobalEventDeconstructWorkbech extends GlobalEventBase {
        type: "deconstructWorkbench";
        data: {
            workbench: Workbench;
        };
    }
    interface GlobalEventClickStatue extends GlobalEventBase {
        type: "clickStatue";
        data: {
            statue: ƒ.Node;
        };
    }
    interface GlobalEventThrownEumlingTop extends GlobalEventBase {
        type: "thrownEumlingTopPosition";
        data: {
            y: number;
        };
    }
    export const maxAchievablePoints: number;
    export {};
}
declare namespace Script {
    class GameData {
        #private;
        static Instance: GameData;
        static paused: boolean;
        constructor();
        static get points(): number;
        static addPoints(_points: number): void;
        static updateDisplays(showProgressOverlay?: boolean): void;
        static updateProgressBar(): void;
        static setupProgressBar(): void;
        private static addEumlingIconsToProgressBar;
        static displayTimeout: number;
        static displayProgressBarOverlay(): void;
        static hideProgressBarOverlay(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    function findAllPickedObjectsUsingPickSphere(_pointer: Pointer): ƒ.Node[];
    interface Clickable {
        shortTap?(_pointer: Pointer): void;
        longTap?(_pointer: Pointer): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Monument extends ƒ.Component implements Clickable {
        shortTap(_pointer: Pointer): void;
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
        onHide: (_element: HTMLElement) => void;
        onRemove: (_element: HTMLElement) => void;
    }
    export function showLayer(_layer: HTMLElement, _options?: Partial<LayerOptions>): void;
    export function removeTopLayer(): void;
    export function removeAllLayers(): void;
    export function spawnEumling(): void;
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
    export class PickSphere extends ƒ.Component {
        #private;
        static readonly iSubclass: number;
        constructor();
        get radius(): number;
        set radius(_r: number);
        get radiusSquared(): number;
        offset: ƒ.Vector3;
        get mtxPick(): ƒ.Matrix4x4;
        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void;
        /**
         * finds all pickSpheres within the given ray
         * @param ray the ray to check against
         * @param options options
         */
        static pick(ray: ƒ.Ray, options?: Partial<PickSpherePickOptions>): PickSphere[];
        private static get defaultOptions();
    }
    interface PickSpherePickOptions {
        /** Sets by what metric to sort the results. Unsorted if undefined */
        sortBy?: "distanceToRay" | "distanceToRayOrigin";
        branch: ƒ.Node;
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    interface BaseCategory {
        img: string;
        name: string;
        id: number;
    }
    interface Category extends BaseCategory {
        id: CATEGORY;
        subcategories: Subcategory[];
    }
    interface Subcategory extends BaseCategory {
        id: SUBCATEGORY;
        preferredTraits: TRAIT[];
    }
    enum CATEGORY {
        NATURE = 1,
        CRAFT = 2
    }
    enum SUBCATEGORY {
        ANIMALS = 100,
        FARMING = 101,
        GARDENING = 102,
        MATERIAL_EXTRACTION = 103,
        PRODUCTION = 104,
        PROCESSING = 105
    }
    class Workbench extends UpdateScriptComponent implements Clickable {
        static categories: Category[];
        private readonly buildSpeed;
        private readonly timeUntilNewTraitRange;
        private category;
        private subcategory;
        private buildProgress;
        private assignee;
        private fittingTraits;
        private startWorkTime;
        private timeUntilNewTrait;
        start(_e: CustomEvent<UpdateEvent>): void;
        shortTap(_pointer: Pointer): void;
        longTap(_pointer: Pointer): void;
        private displayWorkbenchInfo;
        private fillUpgradeOverlayWithInfo;
        private fillInfoOverlayWithInfo;
        private deconstruct;
        private setCategory;
        private resetAll;
        static getCategoryFromId(_id: CATEGORY): Category;
        static getSubcategoryFromId(_id: SUBCATEGORY): Subcategory;
        get needsAssembly(): boolean;
        work(_eumling: ƒ.Node, _timeMS: number): number;
        private attemptToTeachNewTrait;
        private setTimeUntilNewTrait;
        private assignNewEumling;
        unassignEumling(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class WorkbenchVisuals extends UpdateScriptComponent {
        #private;
        default: ƒ.Graph;
        nature_prepare: ƒ.Graph;
        nature: ƒ.Graph;
        nature_animals: ƒ.Graph;
        nature_farming: ƒ.Graph;
        nature_gardening: ƒ.Graph;
        craft_prepare: ƒ.Graph;
        craft: ƒ.Graph;
        craft_mat_extr: ƒ.Graph;
        craft_production: ƒ.Graph;
        craft_processing: ƒ.Graph;
        start(_e: CustomEvent<UpdateEvent>): void;
        private hndSetVisual;
        setVisual(_id: number, _prepare?: boolean): Promise<void>;
    }
}
