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
        /** A pointer starts being pressed / touched */
        EVENT_POINTER["START_TOUCH"] = "pointerstarttouch";
        /** A pointer exits the html element */
        EVENT_POINTER["END"] = "pointerend";
        /** A pointer ends being pressed / touched */
        EVENT_POINTER["END_TOUCH"] = "pointerendtouch";
        /** A pointer changes, either its pressed/touched status or its position */
        EVENT_POINTER["CHANGE"] = "pointerchange";
        /** A pointer is pressed/touched for a longer time. NOT IMPLEMENTED YET */
        // LONG = "pointerlong",
    })(EVENT_POINTER = Script.EVENT_POINTER || (Script.EVENT_POINTER = {}));
    class UnifiedPointerInput extends EventTarget {
        constructor() {
            super(...arguments);
            this.pointers = new Map();
            //assuming only one mouse exists at a time and touches only have positive ids
            this.mouseId = -99;
            this.hndTap = (_event) => {
                let changedTouches = _event.changedTouches;
                if (!changedTouches || changedTouches.length == 0)
                    return;
                for (let touch of changedTouches) {
                    let existingPointer = this.getPointer(touch.identifier);
                    if (!existingPointer)
                        existingPointer = this.createPointerFromTouch(touch);
                    existingPointer.currentX = touch.clientX;
                    existingPointer.currentY = touch.clientY;
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                }
            };
            this.hndTapEnd = (_event) => {
                let changedTouches = _event.changedTouches;
                if (!changedTouches || changedTouches.length == 0)
                    return;
                for (let touch of changedTouches) {
                    let existingPointer = this.getPointer(touch.identifier);
                    if (existingPointer) {
                        this.dispatchEvent(new CustomEvent(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                        this.dispatchEvent(new CustomEvent(EVENT_POINTER.END_TOUCH, { detail: { pointer: existingPointer } }));
                        this.pointers.delete(touch.identifier);
                    }
                }
            };
            this.hndMouseEnter = (_event) => {
                let existingPointer = this.getPointer(this.mouseId);
                if (!existingPointer)
                    existingPointer = this.createPointerFromMouse(_event);
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            };
            this.hndMouseMove = (_event) => {
                let existingPointer = this.getPointer(this.mouseId);
                if (!existingPointer)
                    existingPointer = this.createPointerFromMouse(_event);
                existingPointer.currentX = _event.clientX;
                existingPointer.currentY = _event.clientY;
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            };
            this.hndMouseLeave = (_event) => {
                let existingPointer = this.getPointer(this.mouseId);
                if (existingPointer) {
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.END_TOUCH, { detail: { pointer: existingPointer } }));
                    this.pointers.delete(existingPointer.id);
                }
            };
            this.hndMouseDown = (_event) => {
                let existingPointer = this.getPointer(this.mouseId);
                if (!existingPointer)
                    existingPointer = this.createPointerFromMouse(_event);
                existingPointer.pressed = true;
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.START_TOUCH, { detail: { pointer: existingPointer } }));
            };
            this.hndMouseUp = (_event) => {
                let existingPointer = this.getPointer(this.mouseId);
                if (!existingPointer)
                    existingPointer = this.createPointerFromMouse(_event);
                existingPointer.pressed = false;
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.END_TOUCH, { detail: { pointer: existingPointer } }));
                this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            };
        }
        initialize(_element) {
            console.log("init");
            _element.addEventListener("touchstart", this.hndTap);
            _element.addEventListener("touchmove", this.hndTap);
            _element.addEventListener("touchend", this.hndTapEnd);
            _element.addEventListener("touchcancel", this.hndTapEnd);
            _element.addEventListener("mouseenter", this.hndMouseEnter);
            _element.addEventListener("mousemove", this.hndMouseMove);
            _element.addEventListener("mouseleave", this.hndMouseLeave);
            _element.addEventListener("mousedown", this.hndMouseDown);
            _element.addEventListener("mouseup", this.hndMouseUp);
        }
        getPointer(_id) {
            return this.pointers.get(_id);
        }
        createPointerFromTouch(_touch) {
            let pointer = {
                id: _touch.identifier,
                currentX: _touch.clientX,
                currentY: _touch.clientY,
                startX: _touch.clientX,
                startY: _touch.clientY,
                startTime: ƒ.Time.game.get(),
                pressed: true,
                type: "touch",
            };
            this.pointers.set(_touch.identifier, pointer);
            this.dispatchEvent(new CustomEvent(EVENT_POINTER.START, { detail: { pointer } }));
            this.dispatchEvent(new CustomEvent(EVENT_POINTER.START_TOUCH, { detail: { pointer } }));
            return pointer;
        }
        createPointerFromMouse(_event) {
            let pointer = {
                id: this.mouseId,
                currentX: _event.clientX,
                currentY: _event.clientY,
                startX: _event.clientX,
                startY: _event.clientY,
                startTime: ƒ.Time.game.get(),
                pressed: false,
                type: "mouse",
            };
            this.pointers.set(this.mouseId, pointer);
            this.dispatchEvent(new CustomEvent(EVENT_POINTER.START, { detail: { pointer } }));
            return pointer;
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
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    const upInput = new Script.UnifiedPointerInput();
    function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // runs updates of all updateable components
        Script.UpdateScriptComponent.updateAllInBranch(viewport.getBranch());
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
        if (gameMode) {
            // console.log(upInput.pointerList.length);
            moveCamera(upInput.pointerList);
        }
    }
    let camera;
    let gameMode = false;
    async function startViewport(_event) {
        document.getElementById("start-screen").remove();
        let graphId /* : string */ = document.head.querySelector("meta[autoView]").getAttribute("autoView");
        if (_event.target.id === "freecam") {
            //@ts-ignore
            return window.startInteractiveViewport(graphId);
        }
        gameMode = true;
        await ƒ.Project.loadResourcesFromHTML();
        let graph = ƒ.Project.resources[graphId];
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        camera = Script.findFirstCameraInGraph(graph);
        viewport.initialize("GameViewport", graph, camera, canvas);
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
        // let gsdo = document.getElementById("game-side-detection")
        // gsdo.classList.remove("hidden");
        // gsdo.addEventListener("touchstart", moveCameraTouch);
        // gsdo.addEventListener("touchend", moveCameraTouch);
        // gsdo.addEventListener("touchmove", moveCameraTouch);
        // gsdo.addEventListener("mousemove", moveCameraMouse);
        upInput.initialize(document.getElementById("game-canvas"));
        // upInput.addEventListener(EVENT_POINTER.START, _e => console.log(EVENT_POINTER.START, (<CustomEvent>_e).detail))
        // upInput.addEventListener(EVENT_POINTER.END, _e => console.log(EVENT_POINTER.END, (<CustomEvent>_e).detail))
        // upInput.addEventListener(EVENT_POINTER.CHANGE, _e => console.log(EVENT_POINTER.CHANGE, (<CustomEvent>_e).detail))
    }
    function moveCamera(_pointers) {
        let direction = 0;
        for (let pointer of _pointers) {
            if (pointer.currentX < window.innerWidth * 0.1) {
                direction += 1;
            }
            else if (pointer.currentX > window.innerWidth * 0.9) {
                direction -= 1;
            }
        }
        direction *= 0.1;
        camera.mtxPivot.translateX(direction);
    }
    window.addEventListener("load", init);
    function init() {
        for (let el of document.getElementsByClassName("start-button")) {
            el.addEventListener("click", startViewport);
        }
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
            this.addEventListener("update", this.start, { once: true });
            this.addEventListener("update", this.update);
        }
        // runs updates of all updateable components
        static updateAllInBranch(_branch) {
            let event = new CustomEvent("update");
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
    class EumlingMovement extends Script.UpdateScriptComponent {
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }
        start() {
            // console.log("start");
        }
        ;
        update() {
            // console.log("update");
        }
        ;
    }
    Script.EumlingMovement = EumlingMovement;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let ComponentChangeMaterial = (() => {
        let _classSuper = ƒ.Component;
        let _instanceExtraInitializers = [];
        let _changeMaterial_decorators;
        let _changeMaterial_initializers = [];
        return class ComponentChangeMaterial extends _classSuper {
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _changeMaterial_decorators = [FudgeCore.type(FudgeCore.Material)];
                __esDecorate(null, null, _changeMaterial_decorators, { kind: "field", name: "changeMaterial", static: false, private: false, access: { has: obj => "changeMaterial" in obj, get: obj => obj.changeMaterial, set: (obj, value) => { obj.changeMaterial = value; } }, metadata: _metadata }, _changeMaterial_initializers, _instanceExtraInitializers);
                if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
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
                // if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                //     return;
                // Listen to this component being added to or removed from a node
                this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
            }
            switchMaterial() {
                console.log(this.node.getChild(0).getComponent(ƒ.ComponentMaterial));
                return;
            }
        };
    })();
    Script.ComponentChangeMaterial = ComponentChangeMaterial;
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
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map