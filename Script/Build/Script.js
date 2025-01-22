"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static { this.iSubclass = ƒ.Component.registerSubclass(CustomComponentScript); }
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        break;
                    case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let EVENT_POINTER;
    (function (EVENT_POINTER) {
        /** A pointer enters the html element */
        EVENT_POINTER["START"] = "pointerstart";
        /** A pointer exits the html element */
        EVENT_POINTER["END"] = "pointerend";
        /** A pointer changes, either its pressed/touched status or its position */
        EVENT_POINTER["CHANGE"] = "pointerchange";
        /** A pointer is pressed and released faster than the threshold for a long tap */
        EVENT_POINTER["SHORT"] = "pointershort";
        /** A pointer is pressed/touched for a longer time. */
        EVENT_POINTER["LONG"] = "pointerlong";
    })(EVENT_POINTER = Script.EVENT_POINTER || (Script.EVENT_POINTER = {}));
    const timeUntilLongClickMS = 500;
    const maxDistanceForLongClick = 100;
    class UnifiedPointerInput extends EventTarget {
        constructor() {
            super(...arguments);
            this.pointers = new Map();
            this.hndPointerDown = (_event) => {
                let existingPointer = this.getPointer(_event.pointerId);
                if (!existingPointer)
                    existingPointer = this.createPointerFromPointer(_event);
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.START, { detail: { pointer: existingPointer } }));
                // console.log("pointer down");
            };
            this.hndPointerUp = (_event) => {
                let existingPointer = this.getPointer(_event.pointerId);
                if (existingPointer) {
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                    if (existingPointer.short)
                        this.dispatchEvent(new CustomEvent(EVENT_POINTER.SHORT, { detail: { pointer: existingPointer } }));
                    clearTimeout(existingPointer.longTapTimeout);
                    existingPointer.ended = true;
                    this.pointers.delete(existingPointer.id);
                    // console.log("pointer up");
                }
            };
            this.hndPointerMove = (_event) => {
                let existingPointer = this.getPointer(_event.pointerId);
                if (!existingPointer)
                    return;
                existingPointer.currentX = _event.clientX;
                existingPointer.currentY = _event.clientY;
                if (existingPointer.longTapTimeout && (Math.abs(existingPointer.currentX - existingPointer.startX) > maxDistanceForLongClick ||
                    Math.abs(existingPointer.currentY - existingPointer.startY) > maxDistanceForLongClick)) {
                    clearTimeout(existingPointer.longTapTimeout);
                    existingPointer.short = false;
                }
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            };
        }
        initialize(_element) {
            console.log("init");
            _element.addEventListener("pointerdown", this.hndPointerDown);
            _element.addEventListener("pointerup", this.hndPointerUp);
            _element.addEventListener("pointercancel", this.hndPointerUp);
            _element.addEventListener("pointermove", this.hndPointerMove);
            //prevent defaults
            _element.addEventListener("contextmenu", this.preventDefaults);
            _element.addEventListener("pointerdown", this.preventDefaults);
            _element.addEventListener("pointerup", this.preventDefaults);
            _element.addEventListener("pointermove", this.preventDefaults);
            _element.addEventListener("touchstart", this.preventDefaults);
            _element.addEventListener("touchend", this.preventDefaults);
            _element.addEventListener("touchcancel", this.preventDefaults);
            _element.addEventListener("touchmove", this.preventDefaults);
            _element.addEventListener("dblclick", this.preventDefaults);
            _element.addEventListener("pointercancel", this.preventDefaults);
            _element.addEventListener("scroll", this.preventDefaults);
            _element.addEventListener("scrollend", this.preventDefaults);
        }
        getPointer(_id) {
            return this.pointers.get(_id);
        }
        createPointerFromPointer(_event) {
            let pointer = {
                id: _event.pointerId,
                currentX: _event.clientX,
                currentY: _event.clientY,
                startX: _event.clientX,
                startY: _event.clientY,
                startTime: ƒ.Time.game.get(),
                type: _event.pointerType,
                short: true,
                longTapTimeout: setTimeout(() => {
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.LONG, { detail: { pointer: pointer } }));
                    pointer.short = false;
                }, timeUntilLongClickMS),
            };
            this.pointers.set(pointer.id, pointer);
            this.dispatchEvent(new CustomEvent(EVENT_POINTER.START, { detail: { pointer } }));
            return pointer;
        }
        preventDefaults(_e) {
            _e.preventDefault();
            _e.stopPropagation();
        }
        get pointerList() {
            return Array.from(this.pointers, ([, pointer]) => (pointer));
        }
    }
    Script.UnifiedPointerInput = UnifiedPointerInput;
})(Script || (Script = {}));
/// <reference path="UnifiedPointerInput.ts"/>
var Script;
/// <reference path="UnifiedPointerInput.ts"/>
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    document.addEventListener("interactiveViewportStarted", start);
    Script.upInput = new Script.UnifiedPointerInput();
    Script.eumlingCameraActive = false;
    Script.gravity = 8;
    Script.globalEvents = new EventTarget();
    function start(_event) {
        Script.viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // runs updates of all updateable components
        Script.UpdateScriptComponent.updateAllInBranch(Script.viewport.getBranch());
        // ƒ.Physics.simulate();  // if physics is included and used
        // viewport.draw();
        ƒ.AudioManager.default.update();
        if (!Script.GameData.paused) {
            if (Script.eumlingCameraActive) {
                Script.eumlingViewport.draw();
            }
            else {
                Script.viewport.draw();
            }
        }
        if (gameMode) {
            // console.log(upInput.pointerList.length);
            moveCamera(Script.upInput.pointerList);
        }
    }
    let camera;
    let gameMode = false;
    Script.eumlingCamera = new ƒ.ComponentCamera();
    Script.eumlingViewport = new ƒ.Viewport();
    async function startViewport(_event) {
        if (Script.mobileOrTabletCheck()) {
            document.documentElement.requestFullscreen();
        }
        document.getElementById("start-screen").remove();
        document.getElementById("game-overlay").classList.remove("hidden");
        document.getElementById("achievement-overlay").classList.remove("hidden");
        document.getElementById("achievement-progress-overlay").classList.remove("hidden");
        let graphId /* : string */ = document.head.querySelector("meta[autoView]").getAttribute("autoView");
        if (_event.target.id === "freecam") {
            //@ts-ignore
            return window.startInteractiveViewport(graphId);
        }
        gameMode = true;
        await ƒ.Project.loadResourcesFromHTML();
        let graph = ƒ.Project.resources[graphId];
        let canvas = document.getElementById("game-canvas");
        let viewport = new ƒ.Viewport();
        camera = Script.findFirstCameraInGraph(graph);
        viewport.initialize("GameViewport", graph, camera, canvas);
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
        Script.upInput.initialize(document.getElementById("game-canvas"));
        // upInput.addEventListener(EVENT_POINTER.START, _e => console.log(EVENT_POINTER.START, (<CustomEvent>_e).detail, upInput.pointerList.length))
        // upInput.addEventListener(EVENT_POINTER.END, _e => console.log(EVENT_POINTER.END, (<CustomEvent>_e).detail, upInput.pointerList.length))
        // upInput.addEventListener(EVENT_POINTER.CHANGE, _e => console.log(EVENT_POINTER.CHANGE, (<CustomEvent>_e).detail, upInput.pointerList.length))
        // upInput.addEventListener(EVENT_POINTER.LONG, _e => console.log(EVENT_POINTER.LONG, (<CustomEvent>_e).detail, upInput.pointerList.length))
        Script.eumlingViewport.initialize("EumlingViewport", null, Script.eumlingCamera, document.getElementById("eumling-canvas"));
        Script.eumlingCamera.mtxPivot.translateZ(3);
        Script.eumlingCamera.mtxPivot.translateY(1);
        Script.eumlingCamera.mtxPivot.rotateY(180);
        Script.eumlingCamera.clrBackground = new ƒ.Color(1, 1, 1, 0.1);
        viewport.getBranch().broadcastEvent(new Event("spawnEumling"));
    }
    let currentCameraSpeed = 0;
    const maxCameraSpeed = 10;
    const timeUntilFullSpeed = 2;
    const cameraAcelleration = maxCameraSpeed / timeUntilFullSpeed;
    const cameraBoundaryX = [-8, -2];
    function moveCamera(_pointers) {
        let speed = 0;
        for (let pointer of _pointers) {
            if (pointer.currentX < window.innerWidth * 0.1) {
                pointer.used = true;
                speed -= 1;
            }
            else if (pointer.currentX > window.innerWidth * 0.9) {
                pointer.used = true;
                speed += 1;
            }
        }
        let timeScale = ƒ.Loop.timeFrameGame / 1000;
        if (speed === 0) {
            currentCameraSpeed = 0;
            return;
        }
        currentCameraSpeed = Math.min(maxCameraSpeed, Math.max(0, cameraAcelleration * timeScale + currentCameraSpeed));
        let step = speed * currentCameraSpeed * timeScale;
        let currentX = camera.mtxPivot.translation.x;
        let nextPos = currentX + step;
        if (cameraBoundaryX[0] > nextPos) {
            step = cameraBoundaryX[0] - currentX;
        }
        if (cameraBoundaryX[1] < nextPos) {
            step = cameraBoundaryX[1] - currentX;
        }
        camera.mtxPivot.translateX(-step);
    }
    window.addEventListener("load", init);
    function init() {
        for (let el of document.getElementsByClassName("start-button")) {
            el.addEventListener("click", startViewport);
        }
        document.getElementById("eumlingSpawn").addEventListener("click", () => {
            Script.viewport.getBranch().broadcastEvent(new Event("spawnEumling"));
        });
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class UpdateScriptComponent extends ƒ.Component {
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("preupdate", this.prestart, { once: true });
            this.addEventListener("update", this.start, { once: true });
            this.addEventListener("update", this.update);
        }
        // runs updates of all updateable components
        static updateAllInBranch(_branch) {
            let event = new CustomEvent("update", { detail: { deltaTime: ƒ.Loop.timeFrameGame } });
            let preEvent = new CustomEvent("preupdate", { detail: { deltaTime: ƒ.Loop.timeFrameGame } });
            for (let node of _branch) {
                for (let component of node.getAllComponents()) {
                    if (component instanceof UpdateScriptComponent) {
                        if (component.active)
                            component.dispatchEvent(preEvent);
                    }
                }
            }
            for (let node of _branch) {
                for (let component of node.getAllComponents()) {
                    if (component instanceof UpdateScriptComponent) {
                        if (component.active)
                            component.dispatchEvent(event);
                    }
                }
            }
        }
    }
    Script.UpdateScriptComponent = UpdateScriptComponent;
})(Script || (Script = {}));
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
var Script;
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
(function (Script) {
    var ƒ = FudgeCore;
    let EumlingAnimator = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = Script.UpdateScriptComponent;
        let _instanceExtraInitializers = [];
        let _idle_decorators;
        let _idle_initializers = [];
        let _walk_decorators;
        let _walk_initializers = [];
        let _clickedOn_decorators;
        let _clickedOn_initializers = [];
        let _sit_decorators;
        let _sit_initializers = [];
        let _pick_decorators;
        let _pick_initializers = [];
        let _fall_decorators;
        let _fall_initializers = [];
        let _work_build_decorators;
        let _work_build_initializers = [];
        let _work_build_offset_decorators;
        let _work_build_offset_initializers = [];
        let _work_bad_decorators;
        let _work_bad_initializers = [];
        let _work_bad_offset_decorators;
        let _work_bad_offset_initializers = [];
        let _work_normal_decorators;
        let _work_normal_initializers = [];
        let _work_normal_offset_decorators;
        let _work_normal_offset_initializers = [];
        let _work_good_decorators;
        let _work_good_initializers = [];
        let _work_good_offset_decorators;
        let _work_good_offset_initializers = [];
        var EumlingAnimator = class extends _classSuper {
            static { _classThis = this; }
            constructor() {
                super(...arguments);
                this.idle = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _idle_initializers, void 0));
                this.walk = __runInitializers(this, _walk_initializers, void 0);
                this.clickedOn = __runInitializers(this, _clickedOn_initializers, void 0);
                this.sit = __runInitializers(this, _sit_initializers, void 0);
                this.pick = __runInitializers(this, _pick_initializers, void 0);
                this.fall = __runInitializers(this, _fall_initializers, void 0);
                this.work_build = __runInitializers(this, _work_build_initializers, void 0);
                this.work_build_offset = __runInitializers(this, _work_build_offset_initializers, new ƒ.Vector3());
                this.work_bad = __runInitializers(this, _work_bad_initializers, void 0);
                this.work_bad_offset = __runInitializers(this, _work_bad_offset_initializers, new ƒ.Vector3());
                this.work_normal = __runInitializers(this, _work_normal_initializers, void 0);
                this.work_normal_offset = __runInitializers(this, _work_normal_offset_initializers, new ƒ.Vector3());
                this.work_good = __runInitializers(this, _work_good_initializers, void 0);
                this.work_good_offset = __runInitializers(this, _work_good_offset_initializers, new ƒ.Vector3());
                this.activeAnimation = EumlingAnimator.ANIMATIONS.IDLE;
                this.animations = new Map();
                this.offsets = new Map();
                this.timeout = undefined;
            }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _idle_decorators = [ƒ.serialize(ƒ.Animation)];
                _walk_decorators = [ƒ.serialize(ƒ.Animation)];
                _clickedOn_decorators = [ƒ.serialize(ƒ.Animation)];
                _sit_decorators = [ƒ.serialize(ƒ.Animation)];
                _pick_decorators = [ƒ.serialize(ƒ.Animation)];
                _fall_decorators = [ƒ.serialize(ƒ.Animation)];
                _work_build_decorators = [ƒ.serialize(ƒ.Animation)];
                _work_build_offset_decorators = [ƒ.serialize(ƒ.Vector3)];
                _work_bad_decorators = [ƒ.serialize(ƒ.Animation)];
                _work_bad_offset_decorators = [ƒ.serialize(ƒ.Vector3)];
                _work_normal_decorators = [ƒ.serialize(ƒ.Animation)];
                _work_normal_offset_decorators = [ƒ.serialize(ƒ.Vector3)];
                _work_good_decorators = [ƒ.serialize(ƒ.Animation)];
                _work_good_offset_decorators = [ƒ.serialize(ƒ.Vector3)];
                __esDecorate(null, null, _idle_decorators, { kind: "field", name: "idle", static: false, private: false, access: { has: obj => "idle" in obj, get: obj => obj.idle, set: (obj, value) => { obj.idle = value; } }, metadata: _metadata }, _idle_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _walk_decorators, { kind: "field", name: "walk", static: false, private: false, access: { has: obj => "walk" in obj, get: obj => obj.walk, set: (obj, value) => { obj.walk = value; } }, metadata: _metadata }, _walk_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _clickedOn_decorators, { kind: "field", name: "clickedOn", static: false, private: false, access: { has: obj => "clickedOn" in obj, get: obj => obj.clickedOn, set: (obj, value) => { obj.clickedOn = value; } }, metadata: _metadata }, _clickedOn_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _sit_decorators, { kind: "field", name: "sit", static: false, private: false, access: { has: obj => "sit" in obj, get: obj => obj.sit, set: (obj, value) => { obj.sit = value; } }, metadata: _metadata }, _sit_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _pick_decorators, { kind: "field", name: "pick", static: false, private: false, access: { has: obj => "pick" in obj, get: obj => obj.pick, set: (obj, value) => { obj.pick = value; } }, metadata: _metadata }, _pick_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _fall_decorators, { kind: "field", name: "fall", static: false, private: false, access: { has: obj => "fall" in obj, get: obj => obj.fall, set: (obj, value) => { obj.fall = value; } }, metadata: _metadata }, _fall_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_build_decorators, { kind: "field", name: "work_build", static: false, private: false, access: { has: obj => "work_build" in obj, get: obj => obj.work_build, set: (obj, value) => { obj.work_build = value; } }, metadata: _metadata }, _work_build_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_build_offset_decorators, { kind: "field", name: "work_build_offset", static: false, private: false, access: { has: obj => "work_build_offset" in obj, get: obj => obj.work_build_offset, set: (obj, value) => { obj.work_build_offset = value; } }, metadata: _metadata }, _work_build_offset_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_bad_decorators, { kind: "field", name: "work_bad", static: false, private: false, access: { has: obj => "work_bad" in obj, get: obj => obj.work_bad, set: (obj, value) => { obj.work_bad = value; } }, metadata: _metadata }, _work_bad_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_bad_offset_decorators, { kind: "field", name: "work_bad_offset", static: false, private: false, access: { has: obj => "work_bad_offset" in obj, get: obj => obj.work_bad_offset, set: (obj, value) => { obj.work_bad_offset = value; } }, metadata: _metadata }, _work_bad_offset_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_normal_decorators, { kind: "field", name: "work_normal", static: false, private: false, access: { has: obj => "work_normal" in obj, get: obj => obj.work_normal, set: (obj, value) => { obj.work_normal = value; } }, metadata: _metadata }, _work_normal_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_normal_offset_decorators, { kind: "field", name: "work_normal_offset", static: false, private: false, access: { has: obj => "work_normal_offset" in obj, get: obj => obj.work_normal_offset, set: (obj, value) => { obj.work_normal_offset = value; } }, metadata: _metadata }, _work_normal_offset_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_good_decorators, { kind: "field", name: "work_good", static: false, private: false, access: { has: obj => "work_good" in obj, get: obj => obj.work_good, set: (obj, value) => { obj.work_good = value; } }, metadata: _metadata }, _work_good_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _work_good_offset_decorators, { kind: "field", name: "work_good_offset", static: false, private: false, access: { has: obj => "work_good_offset" in obj, get: obj => obj.work_good_offset, set: (obj, value) => { obj.work_good_offset = value; } }, metadata: _metadata }, _work_good_offset_initializers, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                EumlingAnimator = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            prestart(_e) {
                this.animations.set(EumlingAnimator.ANIMATIONS.EMPTY, new ƒ.AnimationNodeAnimation());
                this.animations.set(EumlingAnimator.ANIMATIONS.IDLE, new ƒ.AnimationNodeAnimation(this.idle));
                this.animations.set(EumlingAnimator.ANIMATIONS.WALK, new ƒ.AnimationNodeAnimation(this.walk));
                this.animations.set(EumlingAnimator.ANIMATIONS.CLICKED_ON, new ƒ.AnimationNodeAnimation(this.clickedOn, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE }));
                this.animations.set(EumlingAnimator.ANIMATIONS.SIT, new ƒ.AnimationNodeAnimation(this.sit, { playmode: ƒ.ANIMATION_PLAYMODE.PLAY_ONCE }));
                this.animations.set(EumlingAnimator.ANIMATIONS.PICKED, new ƒ.AnimationNodeAnimation(this.pick));
                this.animations.set(EumlingAnimator.ANIMATIONS.FALL, new ƒ.AnimationNodeAnimation(this.fall));
                this.animations.set(EumlingAnimator.ANIMATIONS.WORK_BUILD, new ƒ.AnimationNodeAnimation(this.work_build));
                this.animations.set(EumlingAnimator.ANIMATIONS.WORK_BAD, new ƒ.AnimationNodeAnimation(this.work_bad));
                this.animations.set(EumlingAnimator.ANIMATIONS.WORK_NORMAL, new ƒ.AnimationNodeAnimation(this.work_normal));
                this.animations.set(EumlingAnimator.ANIMATIONS.WORK_GOOD, new ƒ.AnimationNodeAnimation(this.work_good));
                this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_BUILD, this.work_build_offset);
                this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_BAD, this.work_bad_offset);
                this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_NORMAL, this.work_normal_offset);
                this.offsets.set(EumlingAnimator.ANIMATIONS.WORK_GOOD, this.work_good_offset);
                this.animPlaying = new ƒ.AnimationNodeTransition(this.animations.get(this.activeAnimation));
                this.animOverlay = new ƒ.AnimationNodeTransition(this.animations.get(EumlingAnimator.ANIMATIONS.EMPTY));
                let rootAnim = new ƒ.AnimationNodeBlend([this.animPlaying, this.animOverlay]);
                this.cmpAnim = new ƒ.ComponentAnimationGraph(rootAnim);
                let importedScene = this.node.getChild(0);
                importedScene.getComponent(ƒ.ComponentAnimation).activate(false);
                importedScene.addComponent(this.cmpAnim);
            }
            transitionToAnimation(_anim, _time = 300) {
                let anim = this.animations.get(_anim);
                if (!anim)
                    return;
                this.animPlaying.transit(anim, _time);
                this.activeAnimation = _anim;
            }
            overlayAnimation(_anim, _time = 100) {
                let anim = this.animations.get(_anim);
                if (!anim)
                    return;
                this.animOverlay.transit(anim, _time);
                if (this.timeout !== undefined) {
                    this.timeout.clear();
                    this.timeout = undefined;
                }
                this.timeout = new ƒ.Timer(ƒ.Time.game, anim.animation.totalTime, 1, () => {
                    this.timeout = undefined;
                    this.animOverlay.transit(this.animations.get(EumlingAnimator.ANIMATIONS.EMPTY), 100);
                });
            }
            getOffset(_anim) {
                return this.offsets.get(_anim) ?? ƒ.Vector3.ZERO();
            }
        };
        return EumlingAnimator = _classThis;
    })();
    Script.EumlingAnimator = EumlingAnimator;
    (function (EumlingAnimator) {
        let ANIMATIONS;
        (function (ANIMATIONS) {
            ANIMATIONS[ANIMATIONS["EMPTY"] = 0] = "EMPTY";
            ANIMATIONS[ANIMATIONS["IDLE"] = 1] = "IDLE";
            ANIMATIONS[ANIMATIONS["WALK"] = 2] = "WALK";
            ANIMATIONS[ANIMATIONS["CLICKED_ON"] = 3] = "CLICKED_ON";
            ANIMATIONS[ANIMATIONS["PICKED"] = 4] = "PICKED";
            ANIMATIONS[ANIMATIONS["FALL"] = 5] = "FALL";
            ANIMATIONS[ANIMATIONS["SIT"] = 6] = "SIT";
            ANIMATIONS[ANIMATIONS["WORK_BUILD"] = 7] = "WORK_BUILD";
            ANIMATIONS[ANIMATIONS["WORK_BAD"] = 8] = "WORK_BAD";
            ANIMATIONS[ANIMATIONS["WORK_NORMAL"] = 9] = "WORK_NORMAL";
            ANIMATIONS[ANIMATIONS["WORK_GOOD"] = 10] = "WORK_GOOD";
        })(ANIMATIONS = EumlingAnimator.ANIMATIONS || (EumlingAnimator.ANIMATIONS = {}));
    })(EumlingAnimator = Script.EumlingAnimator || (Script.EumlingAnimator = {}));
})(Script || (Script = {}));
var Script;
(function (Script) {
    let TRAIT;
    (function (TRAIT) {
        TRAIT[TRAIT["ANIMAL_LOVER"] = 0] = "ANIMAL_LOVER";
        TRAIT[TRAIT["SOCIAL"] = 1] = "SOCIAL";
        TRAIT[TRAIT["NATURE_CONNECTION"] = 2] = "NATURE_CONNECTION";
        TRAIT[TRAIT["ORGANIZED"] = 3] = "ORGANIZED";
        TRAIT[TRAIT["ARTISTIC"] = 4] = "ARTISTIC";
        TRAIT[TRAIT["BODY_STRENGTH"] = 5] = "BODY_STRENGTH";
        TRAIT[TRAIT["FINE_MOTOR_SKILLS"] = 6] = "FINE_MOTOR_SKILLS";
        TRAIT[TRAIT["PATIENCE"] = 7] = "PATIENCE";
    })(TRAIT = Script.TRAIT || (Script.TRAIT = {}));
    Script.traitInfo = new Map([
        [TRAIT.ANIMAL_LOVER, { image: "placeholder.png", name: "Tierlieb" }],
        [TRAIT.ARTISTIC, { image: "placeholder.png", name: "Künstlerisch" }],
        [TRAIT.BODY_STRENGTH, { image: "placeholder.png", name: "Körperkraft" }],
        [TRAIT.FINE_MOTOR_SKILLS, { image: "placeholder.png", name: "Feinmotorisch" }],
        [TRAIT.NATURE_CONNECTION, { image: "placeholder.png", name: "Naturverbunden" }],
        [TRAIT.ORGANIZED, { image: "placeholder.png", name: "Organisiert" }],
        [TRAIT.PATIENCE, { image: "placeholder.png", name: "Geduldig" }],
        [TRAIT.SOCIAL, { image: "placeholder.png", name: "Sozial" }],
    ]);
})(Script || (Script = {}));
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
/// <reference path="../Eumlings/Traits.ts" />
var Script;
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
/// <reference path="../Eumlings/Traits.ts" />
(function (Script) {
    var ƒ = FudgeCore;
    class EumlingData extends Script.UpdateScriptComponent {
        constructor() {
            super(...arguments);
            this.#name = "";
            this.traits = new Set();
        }
        static { this.names = ["Herbert", "Fritz", "Martin", "Fitzhubert", "Horst", "Aluni", "Lyraen", "Nivrel", "Elvaris", "Sylin", "Veyla", "Auren", "Liriel", "Riva", "Moraen", "Tynel", "Lymra", "Ondis", "Floren", "Nymra", "Aeris", "Erya", "Thyra", "Nyra", "Velin", "Fenya", "Arion", "Sylva", "Caelis", "Plenna", "Quira", "Lumel", "Flimra", "Vonae", "Tivra", "Elna", "Myrel"]; }
        #name;
        start(_e) {
            while (this.traits.size < 2) {
                this.traits.add(Script.randomEnum(Script.TRAIT));
            }
            this.nameDisplay = this.node.getChildrenByName("Name")[0].getComponent(ƒ.ComponentText);
            this.name = EumlingData.names[Math.floor(EumlingData.names.length * Math.random())];
        }
        get name() {
            return this.#name;
        }
        set name(_name) {
            this.#name = _name;
            this.nameDisplay.texture.text = this.#name;
        }
        shortTap(_pointer) {
            if (this.node.getComponent(Script.EumlingMovement).getState() === Script.STATE.GROWN || _pointer.used) {
                return;
            }
            this.showSelf();
        }
        showSelf() {
            this.node.addComponent(Script.eumlingCamera);
            Script.eumlingViewport.setBranch(this.node);
            let infoOverlay = document.getElementById("eumling-upgrade-overlay");
            infoOverlay.querySelector("#eumling-name").innerText = this.name;
            let traitsDiv = infoOverlay.querySelector("div#eumling-traits");
            traitsDiv.innerHTML = "";
            let traits = Array.from(this.traits.keys());
            for (let i = 0; i < 4; i++) {
                let trait = Script.traitInfo.get(traits[i]);
                if (trait) {
                    traitsDiv.innerHTML += `<div class="eumling-trait"><img src="Images/${trait.image}" /><span>${trait.name}</span></div>`;
                }
                else {
                    traitsDiv.innerHTML += `<div class="eumling-trait empty"></div>`;
                }
            }
            Script.showLayer(infoOverlay, { onRemove: () => { Script.eumlingCameraActive = false; }, onAdd: () => { Script.eumlingCameraActive = true; } });
            this.node.getComponent(Script.EumlingAnimator).overlayAnimation(Script.EumlingAnimator.ANIMATIONS.CLICKED_ON);
        }
    }
    Script.EumlingData = EumlingData;
})(Script || (Script = {}));
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
var Script;
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
(function (Script) {
    var ƒ = FudgeCore;
    let EumlingMovement = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = Script.UpdateScriptComponent;
        let _instanceExtraInitializers = [];
        let _removeWhenReached_decorators;
        let _removeWhenReached_initializers = [];
        let _speed_decorators;
        let _speed_initializers = [];
        let _idleTimeMSMin_decorators;
        let _idleTimeMSMin_initializers = [];
        let _idleTimeMSMax_decorators;
        let _idleTimeMSMax_initializers = [];
        let _sitTimeMSMin_decorators;
        let _sitTimeMSMin_initializers = [];
        let _sitTimeMSMax_decorators;
        let _sitTimeMSMax_initializers = [];
        var EumlingMovement = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _removeWhenReached_decorators = [ƒ.serialize(Boolean)];
                _speed_decorators = [ƒ.serialize(Number)];
                _idleTimeMSMin_decorators = [ƒ.serialize(Number)];
                _idleTimeMSMax_decorators = [ƒ.serialize(Number)];
                _sitTimeMSMin_decorators = [ƒ.serialize(Number)];
                _sitTimeMSMax_decorators = [ƒ.serialize(Number)];
                __esDecorate(null, null, _removeWhenReached_decorators, { kind: "field", name: "removeWhenReached", static: false, private: false, access: { has: obj => "removeWhenReached" in obj, get: obj => obj.removeWhenReached, set: (obj, value) => { obj.removeWhenReached = value; } }, metadata: _metadata }, _removeWhenReached_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _speed_decorators, { kind: "field", name: "speed", static: false, private: false, access: { has: obj => "speed" in obj, get: obj => obj.speed, set: (obj, value) => { obj.speed = value; } }, metadata: _metadata }, _speed_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _idleTimeMSMin_decorators, { kind: "field", name: "idleTimeMSMin", static: false, private: false, access: { has: obj => "idleTimeMSMin" in obj, get: obj => obj.idleTimeMSMin, set: (obj, value) => { obj.idleTimeMSMin = value; } }, metadata: _metadata }, _idleTimeMSMin_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _idleTimeMSMax_decorators, { kind: "field", name: "idleTimeMSMax", static: false, private: false, access: { has: obj => "idleTimeMSMax" in obj, get: obj => obj.idleTimeMSMax, set: (obj, value) => { obj.idleTimeMSMax = value; } }, metadata: _metadata }, _idleTimeMSMax_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _sitTimeMSMin_decorators, { kind: "field", name: "sitTimeMSMin", static: false, private: false, access: { has: obj => "sitTimeMSMin" in obj, get: obj => obj.sitTimeMSMin, set: (obj, value) => { obj.sitTimeMSMin = value; } }, metadata: _metadata }, _sitTimeMSMin_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _sitTimeMSMax_decorators, { kind: "field", name: "sitTimeMSMax", static: false, private: false, access: { has: obj => "sitTimeMSMax" in obj, get: obj => obj.sitTimeMSMax, set: (obj, value) => { obj.sitTimeMSMax = value; } }, metadata: _metadata }, _sitTimeMSMax_initializers, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                EumlingMovement = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            }
            static { this.maxVelocity = 10; }
            constructor() {
                super();
                this.removeWhenReached = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _removeWhenReached_initializers, true));
                this.speed = __runInitializers(this, _speed_initializers, 1);
                this.idleTimeMSMin = __runInitializers(this, _idleTimeMSMin_initializers, 1000);
                this.idleTimeMSMax = __runInitializers(this, _idleTimeMSMax_initializers, 5000);
                this.sitTimeMSMin = __runInitializers(this, _sitTimeMSMin_initializers, 5000);
                this.sitTimeMSMax = __runInitializers(this, _sitTimeMSMax_initializers, 10000);
                this.state = STATE.GROWN;
                this.nextSwapTimestamp = 0;
                this.velocity = new ƒ.Vector3();
                if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                    return;
            }
            start() {
                this.animator = this.node.getComponent(Script.EumlingAnimator);
                let walkNode = this.node.getParent();
                this.walkArea = walkNode?.getComponent(Script.WalkableArea);
                this.setState(this.state);
            }
            ;
            update(_e) {
                if (Script.eumlingCameraActive)
                    return;
                let now = ƒ.Time.game.get();
                let deltaTimeSeconds = _e.detail.deltaTime / 1000;
                switch (this.state) {
                    case STATE.IDLE:
                        {
                            if (now > this.nextSwapTimestamp) {
                                if (Math.random() < 0.3) {
                                    this.setState(STATE.SIT);
                                }
                                else {
                                    this.targetPosition = this.getPositionToWalkTo();
                                    if (!this.targetPosition)
                                        break;
                                    this.setState(STATE.WALK);
                                }
                            }
                        }
                        break;
                    case STATE.SIT:
                        {
                            if (now > this.nextSwapTimestamp) {
                                this.setState(STATE.IDLE);
                            }
                        }
                        break;
                    case STATE.WALK:
                        {
                            if (!this.targetPosition.equals(this.node.mtxWorld.translation, this.speed * 2)) {
                                let difference = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                                let prevDistance = difference.magnitudeSquared;
                                difference.normalize((this.speed / 1000) * _e.detail.deltaTime);
                                if (prevDistance > difference.magnitudeSquared) {
                                    this.node.mtxLocal.translate(difference, false);
                                }
                                this.node.mtxLocal.lookIn(difference, ƒ.Vector3.Y(1));
                            }
                            else {
                                if (this.removeWhenReached) {
                                    this.targetPosition = undefined;
                                }
                                this.setState(STATE.IDLE);
                            }
                        }
                        break;
                    case STATE.WORK:
                        break;
                    case STATE.PICKED:
                        {
                            let viewDirection = ƒ.Vector3.DIFFERENCE(Script.viewport.camera.mtxWorld.translation, this.node.mtxWorld.translation);
                            this.node.mtxLocal.lookIn(viewDirection, ƒ.Vector3.Y(1));
                            let newPos = this.findPickPosition();
                            let difference = ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation);
                            this.node.mtxLocal.translate(difference, false);
                            this.velocity.set(difference.x / deltaTimeSeconds, difference.y / deltaTimeSeconds, 0);
                            if (this.pointer.ended) {
                                this.setState(STATE.FALL);
                                if (this.velocity.magnitudeSquared > EumlingMovement.maxVelocity * EumlingMovement.maxVelocity)
                                    this.velocity.normalize(EumlingMovement.maxVelocity);
                                let pointer = this.pointer;
                                this.pointer = undefined;
                                //check if dropped over workbench
                                let pickedNodes = Script.findAllPickedObjects(pointer);
                                let wb = pickedNodes.find(n => !!n.getComponent(Script.Workbench));
                                if (!wb)
                                    break;
                                this.node.getComponent(Script.EumlingWork).assign(wb.getComponent(Script.Workbench));
                            }
                        }
                        break;
                    case STATE.FALL:
                        {
                            this.velocity.y -= Script.gravity * deltaTimeSeconds;
                            if (this.node.mtxWorld.translation.x + this.velocity.x * deltaTimeSeconds < this.walkArea.minX ||
                                this.node.mtxWorld.translation.x + this.velocity.x * deltaTimeSeconds > this.walkArea.maxX) {
                                this.velocity.x = 0;
                            }
                            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.velocity, deltaTimeSeconds), false);
                            if (this.node.mtxLocal.translation.y < 0) {
                                this.node.mtxLocal.translateY(0 - this.node.mtxLocal.translation.y);
                                this.velocity.set(0, 0, 0);
                                this.setState(STATE.IDLE);
                            }
                        }
                        break;
                }
            }
            ;
            setState(_state) {
                let now = ƒ.Time.game.get();
                switch (_state) {
                    case STATE.IDLE:
                        this.animator.transitionToAnimation(Script.EumlingAnimator.ANIMATIONS.IDLE, 300);
                        this.nextSwapTimestamp = now + this.idleTimeMSMin + Math.random() * (this.idleTimeMSMax - this.idleTimeMSMin);
                        break;
                    case STATE.FALL:
                        this.animator.transitionToAnimation(Script.EumlingAnimator.ANIMATIONS.FALL, 300);
                        break;
                    case STATE.SIT:
                        this.animator.transitionToAnimation(Script.EumlingAnimator.ANIMATIONS.SIT, 100);
                        this.nextSwapTimestamp = now + this.sitTimeMSMin + Math.random() * (this.sitTimeMSMax - this.sitTimeMSMin);
                        break;
                    case STATE.WALK:
                        this.animator.transitionToAnimation(Script.EumlingAnimator.ANIMATIONS.WALK, 100);
                        break;
                    case STATE.PICKED:
                        if (this.state === STATE.WORK) {
                            this.node.getComponent(Script.EumlingWork).unassign();
                        }
                        this.animator.transitionToAnimation(Script.EumlingAnimator.ANIMATIONS.PICKED, 100);
                        break;
                    case STATE.WORK:
                        break;
                    case STATE.GROWN:
                        this.node.mtxLocal.translateY(-0.95);
                        this.animator.transitionToAnimation(Script.EumlingAnimator.ANIMATIONS.PICKED, 100);
                        break;
                }
                this.state = _state;
            }
            getPositionToWalkTo() {
                for (let i = 0; i < 10; i++) {
                    let newPos = this.walkArea.getPositionInside();
                    if (ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation).magnitudeSquared > 3) {
                        return newPos;
                    }
                }
                return undefined;
            }
            findPickPosition() {
                const ray = Script.viewport.getRayFromClient(new ƒ.Vector2(this.pointer.currentX, this.pointer.currentY));
                const planePos = new ƒ.Vector3(this.walkArea.minX, this.walkArea.Y, this.walkArea.maxZ);
                let pos = ray.intersectPlane(planePos, ƒ.Vector3.Z(1));
                // clean up pos to stay inside walkable area
                pos.x = Math.max(this.walkArea.minX, Math.min(this.walkArea.maxX, pos.x));
                pos.y = Math.max(this.walkArea.Y, pos.y - this.node.radius * 0.62);
                pos.z = Math.max(this.walkArea.minZ, Math.min(this.walkArea.maxZ, pos.z));
                return pos;
            }
            shortTap(_pointer) {
                if (this.state === STATE.GROWN) {
                    this.node.mtxLocal.translateY(-this.node.mtxLocal.translation.y);
                    this.setState(STATE.IDLE);
                    _pointer.used = true;
                    return;
                }
            }
            longTap(_pointer) {
                if (this.state === STATE.GROWN) {
                    this.node.mtxLocal.translateY(-this.node.mtxLocal.translation.y);
                    this.setState(STATE.IDLE);
                    return;
                }
                this.setState(STATE.PICKED);
                this.pointer = _pointer;
            }
            walkAway() {
                this.targetPosition = this.getPositionToWalkTo();
                if (!this.targetPosition)
                    this.walkAway(); //dangerous but probably not an issue
                this.setState(STATE.WALK);
            }
            walkTo(_pos) {
                this.targetPosition = ƒ.Vector3.DIFFERENCE(_pos, this.walkArea.node.mtxWorld.translation);
                this.setState(STATE.WALK);
            }
            teleportTo(_pos, _rot) {
                this.node.mtxLocal.translate(ƒ.Vector3.DIFFERENCE(_pos, this.node.mtxWorld.translation), false);
                if (_rot)
                    this.node.mtxLocal.rotate(ƒ.Vector3.DIFFERENCE(_rot, this.node.mtxWorld.rotation), false);
            }
            teleportBy(_dif, _local) {
                this.node.mtxLocal.translate(_dif, _local);
            }
            stopMoving() {
                if (this.state === STATE.WALK) {
                    this.setState(STATE.IDLE);
                }
                this.animator.overlayAnimation(Script.EumlingAnimator.ANIMATIONS.CLICKED_ON);
            }
            getState() {
                return this.state;
            }
            static {
                __runInitializers(_classThis, _classExtraInitializers);
            }
        };
        return EumlingMovement = _classThis;
    })();
    Script.EumlingMovement = EumlingMovement;
    let STATE;
    (function (STATE) {
        STATE[STATE["IDLE"] = 0] = "IDLE";
        STATE[STATE["FALL"] = 1] = "FALL";
        STATE[STATE["SIT"] = 2] = "SIT";
        STATE[STATE["WALK"] = 3] = "WALK";
        STATE[STATE["PICKED"] = 4] = "PICKED";
        STATE[STATE["WORK"] = 5] = "WORK";
        STATE[STATE["GROWN"] = 6] = "GROWN";
    })(STATE = Script.STATE || (Script.STATE = {}));
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class EumlingSpawner extends Script.UpdateScriptComponent {
        constructor() {
            super(...arguments);
            this.spawn = async () => {
                console.log("spawn eumling");
                let wa = this.node.getComponent(Script.WalkableArea);
                if (!wa)
                    return;
                let newPos = wa.getPositionInside();
                let instance = await ƒ.Project.createGraphInstance(this.eumling);
                instance.mtxLocal.translation = ƒ.Vector3.DIFFERENCE(newPos, this.node.mtxWorld.translation);
                this.node.appendChild(instance);
            };
        }
        start(_e) {
            this.node.addEventListener("spawnEumling", this.spawn, true);
            this.eumling = ƒ.Project.getResourcesByName("Eumling")[0];
        }
    }
    Script.EumlingSpawner = EumlingSpawner;
})(Script || (Script = {}));
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
var Script;
/// <reference path="../Plugins/UpdateScriptComponent.ts" />
(function (Script) {
    var ƒ = FudgeCore;
    let EumlingWork = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = Script.UpdateScriptComponent;
        var EumlingWork = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                EumlingWork = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            start(_e) {
                this.moveComp = this.node.getComponent(Script.EumlingMovement);
                this.animator = this.node.getComponent(Script.EumlingAnimator);
            }
            update(_e) {
                this.work(_e.detail.deltaTime);
            }
            unassign() {
                if (!this.workbench)
                    return;
                let wb = this.workbench;
                this.workbench = undefined;
                wb.unassignEumling();
                this.moveComp.walkAway();
            }
            assign(_wb) {
                let fittingTraits = _wb.work(this.node, 0);
                this.workbench = _wb;
                const anim = this.getWorkAnimation(fittingTraits);
                this.moveComp.teleportTo(_wb.node.mtxWorld.translation, _wb.node.mtxWorld.rotation);
                this.moveComp.teleportBy(this.animator.getOffset(anim), true);
                this.moveComp.setState(Script.STATE.WORK);
                this.updateWorkAnimation(anim);
            }
            getWorkAnimation(_fittingTraits) {
                if (this.workbench.needsAssembly) {
                    return Script.EumlingAnimator.ANIMATIONS.WORK_BUILD;
                }
                else if (_fittingTraits === 0) {
                    return Script.EumlingAnimator.ANIMATIONS.WORK_BAD;
                }
                else if (_fittingTraits === 1) {
                    return Script.EumlingAnimator.ANIMATIONS.WORK_NORMAL;
                }
                else if (_fittingTraits === 2) {
                    return Script.EumlingAnimator.ANIMATIONS.WORK_GOOD;
                }
                return Script.EumlingAnimator.ANIMATIONS.WORK_GOOD;
            }
            updateWorkAnimation(_anim) {
                this.animator.transitionToAnimation(_anim, 100);
            }
            work(_timeMS) {
                if (!this.workbench)
                    return;
                this.workbench.work(this.node, _timeMS);
            }
        };
        return EumlingWork = _classThis;
    })();
    Script.EumlingWork = EumlingWork;
})(Script || (Script = {}));
var Script;
(function (Script) {
    const achievements = [
        // { title: "", description: "", icon: "", reward: 100, checkCompleted(_e) { return true; }, },
        {
            title: "Das passt ja gar nicht",
            description: "Weise einen Eumling einer Station zu, die mit keiner Eigenschaft übereinstimmt.",
            icon: "placeholder.png",
            reward: 10,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "assignEumling")
                    return false;
                if (_e.detail.data.fittingTraits === 0)
                    return true;
                return false;
            }
        },
        {
            title: "Könnte klappen",
            description: "Weise einen Eumling einer Station zu, die mit einer Eigenschaft übereinstimmt.",
            icon: "placeholder.png",
            reward: 15,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "assignEumling" && _e.detail.type !== "eumlingDevelopTrait")
                    return false;
                if (_e.detail.data.fittingTraits === 1)
                    return true;
                return false;
            }
        },
        {
            title: "Perfect Match",
            description: "Weise einen Eumling einer Station zu, die mit zwei Eigenschaften übereinstimmt.",
            icon: "placeholder.png",
            reward: 20,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "assignEumling" && _e.detail.type !== "eumlingDevelopTrait")
                    return false;
                if (_e.detail.data.fittingTraits === 2)
                    return true;
                return false;
            }
        },
        {
            title: "Umschulung",
            description: "Ein Eumling entwickelt eine Eigenschaft an einer eigentlich unpassenden Station",
            icon: "placeholder.png",
            reward: 10,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "eumlingDevelopTrait")
                    return false;
                return true;
            }
        },
        {
            title: "Treue Mitarbeit",
            description: "Ein Eumling arbeitet für mindestens 10 Minuten durchgängig an derselben Station",
            icon: "placeholder.png",
            reward: 15,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "eumlingWorking")
                    return false;
                if (_e.detail.data.workTime > 10 * 60 * 1000)
                    return true;
                return false;
            }
        },
        {
            title: "Allrounder",
            description: "Ein Eumling hat 4 Eigenschaften.",
            icon: "placeholder.png",
            reward: 20,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "eumlingDevelopTrait")
                    return false;
                if (_e.detail.data.traits.size === 4)
                    return true;
                return false;
            }
        },
        {
            title: "Gefunden!",
            description: "Finde alle 3 Eumling-Statuen",
            icon: "placeholder.png",
            reward: 10,
            secret: true,
            checkCompleted: function (_e) {
                if (_e.detail.type !== "clickStatue")
                    return false;
                return false;
            }
        },
    ];
    Script.maxAchievablePoints = achievements.reduce((prev, curr) => prev + curr.reward, 0);
    function popupAchievement(_a) {
        const div = document.createElement("div");
        div.innerHTML = `
        <span class="achievement-title">${_a.title}</span>
        <span class="achievement-description">${_a.description}</span>
        <span class="achievement-reward"><img src="Images/point.svg">+${_a.reward}</span>`;
        div.classList.add("achievement-popup");
        document.getElementById("achievement-overlay").appendChild(div);
        let timeout = setTimeout(() => {
            div.remove();
        }, 10000);
        div.addEventListener("click", () => {
            div.remove();
            clearTimeout(timeout);
        });
        return div;
    }
    function createFlyingPoints(_div, _amt) {
        _div.addEventListener("animationend", async () => {
            let rect = _div.getBoundingClientRect();
            let targetRect = document.getElementById("game-info-wrapper").getBoundingClientRect();
            for (let i = 0; i < _amt; i++) {
                let img = Script.createElementAdvanced("img", { classes: ["flying-point", "no-interact"] });
                img.src = "Images/point.svg";
                img.style.left = rect.x + rect.width * Math.random() + "px";
                img.style.top = rect.y + rect.height * Math.random() + "px";
                document.body.appendChild(img);
                setTimeout(() => {
                    img.style.left = targetRect.left + "px";
                    img.style.top = targetRect.top + "px";
                    setTimeout(() => {
                        Script.GameData.addPoints(1);
                        img.remove();
                    }, 1000);
                }, 1000);
                await Script.waitMS(20);
            }
        });
        _div.addEventListener("animationcancel", () => { Script.GameData.addPoints(_amt); });
    }
    function updateAchievementList() {
        const list = document.getElementById("achievement-list");
        let newElements = [];
        for (let a of achievements) {
            const div = Script.createElementAdvanced("div", {
                classes: ["achievement"],
                innerHTML: `
                <span class="achievement-icon"> <img src="Images/${a.icon}"/></span>
                <span class="achievement-title">${a.secret ? "???" : a.title}</span>
                <div class="achievement-divider"></div>
                <span class="achievement-description">${a.secret ? "???" : a.description}</span>
                <span class="achievement-reward"><img src="Images/point.svg">+${a.reward}</span>`
            });
            if (a.achieved)
                div.classList.add("achieved");
            newElements.push(div);
        }
        list.replaceChildren(...newElements);
    }
    Script.globalEvents.addEventListener("event", checkAchievements);
    function checkAchievements(_e) {
        for (let a of achievements) {
            if (a.achieved)
                continue;
            if (a.checkCompleted(_e)) {
                a.achieved = true;
                let div = popupAchievement(a);
                createFlyingPoints(div, a.reward);
                updateAchievementList();
            }
        }
    }
    document.addEventListener("DOMContentLoaded", updateAchievementList);
})(Script || (Script = {}));
var Script;
(function (Script) {
    // import ƒ = FudgeCore;
    class GameData {
        static { this.Instance = new GameData(); }
        static #points = 0;
        static #totalPoints = 0;
        static #unlockedEumlings = 1;
        static { this.paused = false; }
        static #pointsPerEumling = 20;
        constructor() {
            if (GameData.Instance)
                return GameData.Instance;
        }
        static get points() {
            return this.#points;
        }
        static addPoints(_points) {
            this.#points += _points;
            this.#totalPoints += _points;
            //check new Eumling reached
            const newEumlingAmt = Math.floor(this.#totalPoints / this.#pointsPerEumling) + 1;
            const eumlingsToSpawn = newEumlingAmt - this.#unlockedEumlings;
            for (let i = 0; i < eumlingsToSpawn; i++) {
                this.#unlockedEumlings++;
                setTimeout(() => {
                    Script.viewport.getBranch().broadcastEvent(new Event("spawnEumling"));
                }, 100 * i);
            }
            this.updateDisplays(true);
        }
        static updateDisplays(showProgressOverlay = false) {
            document.querySelectorAll(".total-points-display").forEach(el => el.innerText = this.#totalPoints.toString());
            document.querySelectorAll(".point-display").forEach(el => el.innerText = this.#points.toString());
            document.querySelectorAll(".eumling-display").forEach(el => el.innerText = this.#unlockedEumlings.toString());
            this.updateProgressBar();
            if (showProgressOverlay)
                this.displayProgressBarOverlay();
        }
        static updateProgressBar() {
            let wrappers = document.querySelectorAll(".achievement-progress-bar-wrapper");
            wrappers.forEach(wrapper => {
                wrapper.style.setProperty("--totalPoints", Script.maxAchievablePoints.toString());
                wrapper.style.setProperty("--pointsUntilEumling", this.#pointsPerEumling.toString());
            });
            const progress = this.#totalPoints / Script.maxAchievablePoints;
            const elements = document.querySelectorAll(".achievement-progress-bar-now");
            elements.forEach(element => {
                element.style.width = progress * 100 + "%";
            });
        }
        static displayProgressBarOverlay() {
            const overlay = document.getElementById("achievement-progress-overlay");
            clearTimeout(this.displayTimeout);
            overlay.classList.remove("hide");
            this.displayTimeout = setTimeout(this.hideProgressBarOverlay, 3000);
        }
        static hideProgressBarOverlay() {
            const overlay = document.getElementById("achievement-progress-overlay");
            overlay.classList.add("hide");
        }
    }
    Script.GameData = GameData;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    Script.upInput.addEventListener(Script.EVENT_POINTER.LONG, longTap);
    Script.upInput.addEventListener(Script.EVENT_POINTER.SHORT, shortTap);
    Script.upInput.addEventListener(Script.EVENT_POINTER.START, startTap);
    function longTap(_e) {
        if (_e.detail.pointer.used)
            return;
        let pickedNode = findFrontPickedObject(_e.detail.pointer);
        if (!pickedNode)
            return;
        pickedNode.getAllComponents()
            .filter(c => !!c.longTap && c.isActive)
            .forEach(c => c.longTap(_e.detail.pointer));
    }
    function shortTap(_e) {
        if (_e.detail.pointer.used)
            return;
        let pickedNode = findFrontPickedObject(_e.detail.pointer);
        if (!pickedNode)
            return;
        pickedNode.getAllComponents()
            .filter(c => !!c.shortTap && c.isActive)
            .forEach(c => c.shortTap(_e.detail.pointer));
    }
    function startTap(_e) {
        let frontEumling = findAllPickedObjects(_e.detail.pointer).filter(n => n.getComponent(Script.EumlingMovement)).sort(sortByDistance).pop();
        if (frontEumling) {
            frontEumling.getComponent(Script.EumlingMovement).stopMoving();
        }
    }
    function findFrontPickedObject(_p) {
        let pickedNodes = findAllPickedObjects(_p);
        pickedNodes.sort(sortByDistance);
        return pickedNodes.pop();
    }
    Script.findFrontPickedObject = findFrontPickedObject;
    function sortByDistance(a, b) {
        return a.mtxWorld.translation.z - b.mtxWorld.translation.z;
    }
    function findAllPickedObjects(_pointer) {
        const picks = ƒ.Picker.pickViewport(Script.viewport, new ƒ.Vector2(_pointer.currentX, _pointer.currentY));
        let pickedNodes = [];
        for (let pick of picks) {
            let pickedNode = findPickableNodeInTree(pick.node);
            if (!pickedNode)
                continue;
            pickedNodes.push(pickedNode);
        }
        return pickedNodes;
    }
    Script.findAllPickedObjects = findAllPickedObjects;
    function findPickableNodeInTree(node) {
        if (!node)
            return undefined;
        let pick = node.getComponent(ƒ.ComponentPick);
        if (pick)
            return node;
        return findPickableNodeInTree(node.getParent());
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let ComponentChangeMaterial = (() => {
        var _a;
        let _classDecorators = [(_a = FudgeCore).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = ƒ.ComponentScript;
        let _instanceExtraInitializers = [];
        let _changeMaterial_decorators;
        let _changeMaterial_initializers = [];
        var ComponentChangeMaterial = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _changeMaterial_decorators = [FudgeCore.serialize(FudgeCore.Material)];
                __esDecorate(null, null, _changeMaterial_decorators, { kind: "field", name: "changeMaterial", static: false, private: false, access: { has: obj => "changeMaterial" in obj, get: obj => obj.changeMaterial, set: (obj, value) => { obj.changeMaterial = value; } }, metadata: _metadata }, _changeMaterial_initializers, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ComponentChangeMaterial = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            }
            static { this.iSubclass = ƒ.Component.registerSubclass(ComponentChangeMaterial); }
            constructor() {
                super();
                this.changeMaterial = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _changeMaterial_initializers, null));
                // Activate the functions of this component as response to events
                this.hndEvent = (_event) => {
                    switch (_event.type) {
                        case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                            break;
                        case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                            this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                            this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                            break;
                        case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                            this.switchMaterial();
                            break;
                    }
                };
                if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                    return;
                // Listen to this component being added to or removed from a node
                this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
            }
            switchMaterial() {
                for (const node of this.node) {
                    if (node.getComponent(ƒ.ComponentMaterial) != null) {
                        node.getComponent(ƒ.ComponentMaterial).material = this.changeMaterial;
                    }
                }
            }
            static {
                __runInitializers(_classThis, _classExtraInitializers);
            }
        };
        return ComponentChangeMaterial = _classThis;
    })();
    Script.ComponentChangeMaterial = ComponentChangeMaterial;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    const activeLayers = [];
    function showLayer(_layer, _options = {}) {
        if (!_layer)
            return;
        hideTopLayer();
        activeLayers.push([_layer, _options]);
        showTopLayer();
    }
    Script.showLayer = showLayer;
    function removeTopLayer() {
        hideTopLayer();
        activeLayers.pop();
    }
    Script.removeTopLayer = removeTopLayer;
    function showTopLayer() {
        if (activeLayers.length == 0)
            return;
        let [layer, options] = activeLayers[activeLayers.length - 1];
        layer.classList.remove("hidden");
        if (options.onAdd)
            options.onAdd(layer);
        layer.style.zIndex = "1000";
    }
    function hideTopLayer() {
        if (activeLayers.length == 0)
            return;
        let [layer, options] = activeLayers[activeLayers.length - 1];
        layer.classList.add("hidden");
        if (options.onRemove)
            options.onRemove(layer);
        layer.style.zIndex = "";
    }
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".close-button").forEach(b => {
            b.addEventListener("click", hideTopLayer);
            b.addEventListener("click", unpauseGame);
        });
        document.getElementById("achievement-button").addEventListener("click", () => { showLayer(document.getElementById("achievement-screen-overlay")); });
        document.getElementById("pause-button").addEventListener("click", pauseGame);
        document.getElementById("pause-button").addEventListener("click", pauseGame);
        Script.GameData.updateDisplays();
    });
    function pauseGame() {
        Script.GameData.paused = true;
        showLayer(document.getElementById("pause-overlay"));
        ƒ.Time.game.setScale(0.000001);
    }
    function unpauseGame() {
        Script.GameData.paused = false;
        ƒ.Time.game.setScale(1);
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let WalkableArea = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = ƒ.Component;
        let _instanceExtraInitializers = [];
        let _width_decorators;
        let _width_initializers = [];
        let _depth_decorators;
        let _depth_initializers = [];
        var WalkableArea = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _width_decorators = [ƒ.serialize(Number)];
                _depth_decorators = [ƒ.serialize(Number)];
                __esDecorate(null, null, _width_decorators, { kind: "field", name: "width", static: false, private: false, access: { has: obj => "width" in obj, get: obj => obj.width, set: (obj, value) => { obj.width = value; } }, metadata: _metadata }, _width_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _depth_decorators, { kind: "field", name: "depth", static: false, private: false, access: { has: obj => "depth" in obj, get: obj => obj.depth, set: (obj, value) => { obj.depth = value; } }, metadata: _metadata }, _depth_initializers, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                WalkableArea = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            }
            static { this.iSubclass = ƒ.Component.registerSubclass(WalkableArea); }
            constructor() {
                super();
                this.width = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _width_initializers, 1));
                this.depth = __runInitializers(this, _depth_initializers, 1);
                if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                    return;
            }
            getPositionInside() {
                return ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(this.width * Math.random(), 0, this.depth * Math.random()));
            }
            get minX() {
                return this.node.mtxWorld.translation.x;
            }
            get maxX() {
                return this.node.mtxWorld.translation.x + this.width;
            }
            get Y() {
                return this.node.mtxWorld.translation.y;
            }
            get minZ() {
                return this.node.mtxWorld.translation.z;
            }
            get maxZ() {
                return this.node.mtxWorld.translation.z + this.depth;
            }
            drawGizmos(_cmpCamera) {
                const corners = [
                    this.node.mtxWorld.translation,
                    ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(this.width, 0, 0)),
                    ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(this.width, 0, this.depth)),
                    ƒ.Vector3.SUM(this.node.mtxWorld.translation, new ƒ.Vector3(0, 0, this.depth)),
                ];
                ƒ.Gizmos.drawLines([corners[0], corners[1], corners[1], corners[2], corners[2], corners[3], corners[3], corners[0]], ƒ.Matrix4x4.IDENTITY(), ƒ.Color.CSS("blue"));
            }
            static {
                __runInitializers(_classThis, _classExtraInitializers);
            }
        };
        return WalkableArea = _classThis;
    })();
    Script.WalkableArea = WalkableArea;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    function findFirstCameraInGraph(_graph) {
        let cam = _graph.getComponent(ƒ.ComponentCamera);
        if (cam)
            return cam;
        for (let child of _graph.getChildren()) {
            cam = findFirstCameraInGraph(child);
            if (cam)
                return cam;
        }
        return undefined;
    }
    Script.findFirstCameraInGraph = findFirstCameraInGraph;
    function randomEnum(anEnum) {
        const enumValues = Object.keys(anEnum)
            .map(n => Number.parseInt(n))
            .filter(n => !Number.isNaN(n));
        const randomIndex = Math.floor(Math.random() * enumValues.length);
        const randomEnumValue = enumValues[randomIndex];
        return randomEnumValue;
    }
    Script.randomEnum = randomEnum;
    function mobileOrTabletCheck() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    Script.mobileOrTabletCheck = mobileOrTabletCheck;
    function createElementAdvanced(_type, _options = {}) {
        let el = document.createElement(_type);
        if (_options.classes) {
            el.classList.add(..._options.classes);
        }
        if (_options.innerHTML) {
            el.innerHTML = _options.innerHTML;
        }
        return el;
    }
    Script.createElementAdvanced = createElementAdvanced;
    function shuffleArray(_array) {
        for (let i = _array.length - 1; i >= 0; i--) {
            const k = Math.floor(Math.random() * (i + 1));
            [_array[i], _array[k]] = [_array[k], _array[i]];
        }
        return _array;
    }
    Script.shuffleArray = shuffleArray;
    async function waitMS(_ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, _ms);
        });
    }
    Script.waitMS = waitMS;
})(Script || (Script = {}));
/// <reference path="../Eumlings/Traits.ts" />
var Script;
/// <reference path="../Eumlings/Traits.ts" />
(function (Script) {
    var ƒ = FudgeCore;
    let CATEGORY;
    (function (CATEGORY) {
        CATEGORY[CATEGORY["NATURE"] = 1] = "NATURE";
        CATEGORY[CATEGORY["CRAFT"] = 2] = "CRAFT";
    })(CATEGORY = Script.CATEGORY || (Script.CATEGORY = {}));
    let SUBCATEGORY;
    (function (SUBCATEGORY) {
        SUBCATEGORY[SUBCATEGORY["ANIMALS"] = 100] = "ANIMALS";
        SUBCATEGORY[SUBCATEGORY["FARMING"] = 101] = "FARMING";
        SUBCATEGORY[SUBCATEGORY["GARDENING"] = 102] = "GARDENING";
        SUBCATEGORY[SUBCATEGORY["MATERIAL_EXTRACTION"] = 103] = "MATERIAL_EXTRACTION";
        SUBCATEGORY[SUBCATEGORY["PRODUCTION"] = 104] = "PRODUCTION";
        SUBCATEGORY[SUBCATEGORY["PROCESSING"] = 105] = "PROCESSING";
    })(SUBCATEGORY = Script.SUBCATEGORY || (Script.SUBCATEGORY = {}));
    class Workbench extends Script.UpdateScriptComponent {
        constructor() {
            super(...arguments);
            this.buildSpeed = 1 / 10;
            this.traitUnlockChancePerSecond = 1 / 60;
            this.category = undefined;
            this.subcategory = undefined;
            this.buildProgress = 0;
            this.fittingTraits = 0;
            this.startWorkTime = 0;
        }
        static { this.categories = [
            {
                id: CATEGORY.NATURE,
                name: "Natur",
                img: "placeholder.png",
                subcategories: [
                    { id: SUBCATEGORY.ANIMALS, img: "placeholder.png", name: "Tierwirtschaft", preferredTraits: [Script.TRAIT.ANIMAL_LOVER, Script.TRAIT.SOCIAL] },
                    { id: SUBCATEGORY.FARMING, img: "placeholder.png", name: "Landwirtschaft", preferredTraits: [Script.TRAIT.NATURE_CONNECTION, Script.TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.GARDENING, img: "placeholder.png", name: "Gartenbau", preferredTraits: [Script.TRAIT.NATURE_CONNECTION, Script.TRAIT.ARTISTIC] },
                ]
            },
            {
                id: CATEGORY.CRAFT,
                name: "Handwerk",
                img: "placeholder.png",
                subcategories: [
                    { id: SUBCATEGORY.MATERIAL_EXTRACTION, img: "placeholder.png", name: "Rohstoffgewinnung", preferredTraits: [Script.TRAIT.BODY_STRENGTH, Script.TRAIT.ORGANIZED] },
                    { id: SUBCATEGORY.PRODUCTION, img: "placeholder.png", name: "Produktion", preferredTraits: [Script.TRAIT.FINE_MOTOR_SKILLS, Script.TRAIT.PATIENCE] },
                    { id: SUBCATEGORY.PROCESSING, img: "placeholder.png", name: "Verarbeitung", preferredTraits: [Script.TRAIT.ARTISTIC, Script.TRAIT.FINE_MOTOR_SKILLS] },
                ]
            },
        ]; }
        start(_e) {
        }
        shortTap(_pointer) {
            this.displayWorkbenchInfo();
        }
        longTap(_pointer) {
            this.displayWorkbenchInfo();
        }
        displayWorkbenchInfo() {
            let overlay;
            if (!this.category) {
                overlay = this.fillUpgradeOverlayWithInfo("Wähle eine Kategorie", Workbench.categories);
            }
            else if (!this.subcategory) {
                if (this.buildProgress < 1) {
                    overlay = this.fillInfoOverlayWithInfo();
                }
                else {
                    overlay = this.fillUpgradeOverlayWithInfo("Wähle eine Spezialisierung", Workbench.categories.find(c => c.id === this.category).subcategories);
                }
            }
            else {
                overlay = this.fillInfoOverlayWithInfo();
            }
            if (!overlay)
                return;
            Script.showLayer(overlay);
        }
        fillUpgradeOverlayWithInfo(_title, _options) {
            const overlay = document.getElementById("workbench-upgrade-overlay");
            const title = overlay.querySelector("h2");
            const options = overlay.querySelector("div#workbench-options-wrapper");
            title.innerText = _title;
            let newOptions = [];
            for (let opt of _options) {
                const div = document.createElement("div");
                div.classList.add("workbench-option", "button");
                div.innerHTML = `<img src="Images/${opt.img}" alt="${opt.name}" /><span>${opt.name}</span>`;
                newOptions.push(div);
                div.addEventListener("click", () => {
                    this.setCategory(opt.id);
                    Script.removeTopLayer();
                });
            }
            options.replaceChildren(...newOptions);
            return overlay;
        }
        fillInfoOverlayWithInfo() {
            const overlay = document.getElementById("workbench-info-overlay");
            const info = overlay.querySelector("div#workbench-info-categories");
            let categories = [Workbench.getCategoryFromId(this.category), Workbench.getSubcategoryFromId(this.subcategory)];
            info.innerHTML = "";
            for (let cat of categories) {
                if (!cat)
                    continue;
                info.innerHTML += `<div class="workbench-category"><img src="Images/${cat.img}" alt="${cat.name}" /><span>${cat.name}</span></div>`;
            }
            overlay.querySelector("progress").value = this.buildProgress;
            overlay.querySelector("#workbench-deconstruct").addEventListener("click", () => {
                this.resetAll();
                Script.removeTopLayer();
            });
            return overlay;
        }
        setCategory(_id) {
            if (this.category === undefined) {
                this.category = _id;
            }
            else if (this.subcategory === undefined) {
                this.subcategory = _id;
                this.node.dispatchEvent(new CustomEvent("setVisual", { detail: _id }));
            }
        }
        resetAll() {
            this.category = this.subcategory = undefined;
            this.buildProgress = 0;
            this.node.dispatchEvent(new CustomEvent("setVisual", { detail: 0 }));
        }
        static getCategoryFromId(_id) {
            return this.categories.find(c => c.id === _id);
        }
        static getSubcategoryFromId(_id) {
            for (let cat of this.categories) {
                let found = cat.subcategories.find(c => c.id === _id);
                if (found)
                    return found;
            }
            return undefined;
        }
        get needsAssembly() {
            return (this.category && this.buildProgress < 1);
        }
        work(_eumling, _timeMS) {
            if (this.assignee !== _eumling) {
                this.assignNewEumling(_eumling);
            }
            if (!this.category) {
                this.unassignEumling();
            }
            else if (!this.subcategory) {
                if (this.buildProgress < 1) {
                    this.buildProgress += this.buildSpeed * _timeMS / 1000;
                }
                else {
                    this.node.dispatchEvent(new CustomEvent("setVisual", { detail: this.category }));
                    this.unassignEumling();
                }
            }
            if (this.assignee) {
                Script.globalEvents.dispatchEvent(new CustomEvent("event", { detail: { type: "eumlingWorking", data: { workTime: ƒ.Time.game.get() - this.startWorkTime } } }));
                if (this.fittingTraits < 2) {
                    this.attemptToTeachNewTrait(_timeMS);
                }
            }
            return this.fittingTraits;
        }
        attemptToTeachNewTrait(_timeMS) {
            if (!this.subcategory)
                return;
            let data = this.assignee.getComponent(Script.EumlingData);
            if (data.traits.size >= 4)
                return;
            if (Math.random() > (_timeMS / 1000) * this.traitUnlockChancePerSecond)
                return;
            let requiredTraits = [...Workbench.getSubcategoryFromId(this.subcategory).preferredTraits];
            Script.shuffleArray(requiredTraits);
            for (let trait of requiredTraits) {
                if (!data.traits.has(trait)) {
                    data.traits.add(trait);
                    break;
                }
            }
            this.fittingTraits++;
            Script.globalEvents.dispatchEvent(new CustomEvent("event", { detail: { type: "eumlingDevelopTrait", data: { fittingTraits: this.fittingTraits, traits: data.traits, eumling: this.assignee } } }));
            const ew = this.assignee.getComponent(Script.EumlingWork);
            ew.updateWorkAnimation(ew.getWorkAnimation(this.fittingTraits));
        }
        assignNewEumling(_eumling) {
            this.unassignEumling();
            this.assignee = _eumling;
            this.startWorkTime = ƒ.Time.game.get();
            this.fittingTraits = 0;
            if (this.subcategory) {
                let sub = Workbench.getSubcategoryFromId(this.subcategory);
                let assigneeTraits = this.assignee.getComponent(Script.EumlingData).traits;
                for (let t of sub.preferredTraits) {
                    if (assigneeTraits.has(t))
                        this.fittingTraits++;
                }
                Script.globalEvents.dispatchEvent(new CustomEvent("event", { detail: { type: "assignEumling", data: { fittingTraits: this.fittingTraits } } }));
            }
        }
        unassignEumling() {
            if (!this.assignee)
                return;
            this.assignee.getComponent(Script.EumlingWork).unassign();
            this.assignee = undefined;
            Script.globalEvents.dispatchEvent(new CustomEvent("event", { detail: { type: "unassignEumling", data: { workTime: ƒ.Time.game.get() - this.startWorkTime } } }));
        }
    }
    Script.Workbench = Workbench;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let WorkbenchVisuals = (() => {
        var _a;
        let _classDecorators = [(_a = ƒ).serialize.bind(_a)];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = Script.UpdateScriptComponent;
        let _instanceExtraInitializers = [];
        let _default_decorators;
        let _default_initializers = [];
        let _nature_decorators;
        let _nature_initializers = [];
        let _nature_animals_decorators;
        let _nature_animals_initializers = [];
        let _nature_farming_decorators;
        let _nature_farming_initializers = [];
        let _nature_gardening_decorators;
        let _nature_gardening_initializers = [];
        let _craft_decorators;
        let _craft_initializers = [];
        let _craft_mat_extr_decorators;
        let _craft_mat_extr_initializers = [];
        let _craft_production_decorators;
        let _craft_production_initializers = [];
        let _craft_processing_decorators;
        let _craft_processing_initializers = [];
        var WorkbenchVisuals = class extends _classSuper {
            static { _classThis = this; }
            constructor() {
                super(...arguments);
                this.default = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _default_initializers, void 0));
                this.nature = __runInitializers(this, _nature_initializers, void 0);
                this.nature_animals = __runInitializers(this, _nature_animals_initializers, void 0);
                this.nature_farming = __runInitializers(this, _nature_farming_initializers, void 0);
                this.nature_gardening = __runInitializers(this, _nature_gardening_initializers, void 0);
                this.craft = __runInitializers(this, _craft_initializers, void 0);
                this.craft_mat_extr = __runInitializers(this, _craft_mat_extr_initializers, void 0);
                this.craft_production = __runInitializers(this, _craft_production_initializers, void 0);
                this.craft_processing = __runInitializers(this, _craft_processing_initializers, void 0);
                this.#graphs = new Map();
                this.hndSetVisual = (_e) => {
                    this.setVisual(_e.detail);
                };
            }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _default_decorators = [ƒ.serialize(ƒ.Graph)];
                _nature_decorators = [ƒ.serialize(ƒ.Graph)];
                _nature_animals_decorators = [ƒ.serialize(ƒ.Graph)];
                _nature_farming_decorators = [ƒ.serialize(ƒ.Graph)];
                _nature_gardening_decorators = [ƒ.serialize(ƒ.Graph)];
                _craft_decorators = [ƒ.serialize(ƒ.Graph)];
                _craft_mat_extr_decorators = [ƒ.serialize(ƒ.Graph)];
                _craft_production_decorators = [ƒ.serialize(ƒ.Graph)];
                _craft_processing_decorators = [ƒ.serialize(ƒ.Graph)];
                __esDecorate(null, null, _default_decorators, { kind: "field", name: "default", static: false, private: false, access: { has: obj => "default" in obj, get: obj => obj.default, set: (obj, value) => { obj.default = value; } }, metadata: _metadata }, _default_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _nature_decorators, { kind: "field", name: "nature", static: false, private: false, access: { has: obj => "nature" in obj, get: obj => obj.nature, set: (obj, value) => { obj.nature = value; } }, metadata: _metadata }, _nature_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _nature_animals_decorators, { kind: "field", name: "nature_animals", static: false, private: false, access: { has: obj => "nature_animals" in obj, get: obj => obj.nature_animals, set: (obj, value) => { obj.nature_animals = value; } }, metadata: _metadata }, _nature_animals_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _nature_farming_decorators, { kind: "field", name: "nature_farming", static: false, private: false, access: { has: obj => "nature_farming" in obj, get: obj => obj.nature_farming, set: (obj, value) => { obj.nature_farming = value; } }, metadata: _metadata }, _nature_farming_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _nature_gardening_decorators, { kind: "field", name: "nature_gardening", static: false, private: false, access: { has: obj => "nature_gardening" in obj, get: obj => obj.nature_gardening, set: (obj, value) => { obj.nature_gardening = value; } }, metadata: _metadata }, _nature_gardening_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _craft_decorators, { kind: "field", name: "craft", static: false, private: false, access: { has: obj => "craft" in obj, get: obj => obj.craft, set: (obj, value) => { obj.craft = value; } }, metadata: _metadata }, _craft_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _craft_mat_extr_decorators, { kind: "field", name: "craft_mat_extr", static: false, private: false, access: { has: obj => "craft_mat_extr" in obj, get: obj => obj.craft_mat_extr, set: (obj, value) => { obj.craft_mat_extr = value; } }, metadata: _metadata }, _craft_mat_extr_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _craft_production_decorators, { kind: "field", name: "craft_production", static: false, private: false, access: { has: obj => "craft_production" in obj, get: obj => obj.craft_production, set: (obj, value) => { obj.craft_production = value; } }, metadata: _metadata }, _craft_production_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _craft_processing_decorators, { kind: "field", name: "craft_processing", static: false, private: false, access: { has: obj => "craft_processing" in obj, get: obj => obj.craft_processing, set: (obj, value) => { obj.craft_processing = value; } }, metadata: _metadata }, _craft_processing_initializers, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                WorkbenchVisuals = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            #graphs;
            start(_e) {
                this.#graphs.set(0, this.default);
                this.#graphs.set(Script.CATEGORY.NATURE, this.nature);
                this.#graphs.set(Script.SUBCATEGORY.ANIMALS, this.nature_animals);
                this.#graphs.set(Script.SUBCATEGORY.FARMING, this.nature_farming);
                this.#graphs.set(Script.SUBCATEGORY.GARDENING, this.nature_gardening);
                this.#graphs.set(Script.CATEGORY.CRAFT, this.craft);
                this.#graphs.set(Script.SUBCATEGORY.MATERIAL_EXTRACTION, this.craft_mat_extr);
                this.#graphs.set(Script.SUBCATEGORY.PROCESSING, this.craft_processing);
                this.#graphs.set(Script.SUBCATEGORY.PRODUCTION, this.craft_production);
                this.setVisual(0);
                this.node.addEventListener("setVisual", this.hndSetVisual);
            }
            setVisual(_id) {
                let graph = this.#graphs.get(_id);
                if (!graph)
                    return;
                this.node.removeAllChildren();
                this.node.appendChild(graph);
            }
        };
        return WorkbenchVisuals = _classThis;
    })();
    Script.WorkbenchVisuals = WorkbenchVisuals;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map