"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
    const maxDistanceForLongClick = 20;
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
            };
            this.hndPointerUp = (_event) => {
                let existingPointer = this.getPointer(_event.pointerId);
                if (existingPointer) {
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                    this.dispatchEvent(new CustomEvent(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                    if (existingPointer.short)
                        this.dispatchEvent(new CustomEvent(EVENT_POINTER.SHORT, { detail: { pointer: existingPointer } }));
                    clearTimeout(existingPointer.longTapTimeout);
                    this.pointers.delete(existingPointer.id);
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
    function start(_event) {
        Script.viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // runs updates of all updateable components
        Script.UpdateScriptComponent.updateAllInBranch(Script.viewport.getBranch());
        // ƒ.Physics.simulate();  // if physics is included and used
        Script.viewport.draw();
        ƒ.AudioManager.default.update();
        if (gameMode) {
            // console.log(upInput.pointerList.length);
            moveCamera(Script.upInput.pointerList);
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
        Script.upInput.initialize(document.getElementById("game-canvas"));
        // upInput.addEventListener(EVENT_POINTER.START, _e => console.log(EVENT_POINTER.START, (<CustomEvent>_e).detail, upInput.pointerList.length))
        // upInput.addEventListener(EVENT_POINTER.END, _e => console.log(EVENT_POINTER.END, (<CustomEvent>_e).detail, upInput.pointerList.length))
        // upInput.addEventListener(EVENT_POINTER.CHANGE, _e => console.log(EVENT_POINTER.CHANGE, (<CustomEvent>_e).detail, upInput.pointerList.length))
        // upInput.addEventListener(EVENT_POINTER.LONG, _e => console.log(EVENT_POINTER.LONG, (<CustomEvent>_e).detail, upInput.pointerList.length))
    }
    let currentCameraSpeed = 0;
    const maxCameraSpeed = 10;
    const timeUntilFullSpeed = 2;
    const cameraAcelleration = maxCameraSpeed / timeUntilFullSpeed;
    const cameraBoundaryX = [-7, -2];
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
            this.addEventListener("update", this.start, { once: true });
            this.addEventListener("update", this.update);
        }
        // runs updates of all updateable components
        static updateAllInBranch(_branch) {
            let event = new CustomEvent("update", { detail: { deltaTime: ƒ.Loop.timeFrameGame } });
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
    class EumlingData extends Script.UpdateScriptComponent {
        constructor() {
            super(...arguments);
            this.name = "";
        }
        static { this.names = ["Herbert", "Fritz", "Martin", "Fitzhubert", "Horst"]; }
        start(_e) {
            this.name = EumlingData.names[Math.floor(EumlingData.names.length * Math.random())];
        }
        update(_e) {
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
        let _avgIdleTimeSeconds_decorators;
        let _avgIdleTimeSeconds_initializers = [];
        var EumlingMovement = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _removeWhenReached_decorators = [ƒ.serialize(Boolean)];
                _speed_decorators = [ƒ.serialize(Number)];
                _avgIdleTimeSeconds_decorators = [ƒ.serialize(Number)];
                __esDecorate(null, null, _removeWhenReached_decorators, { kind: "field", name: "removeWhenReached", static: false, private: false, access: { has: obj => "removeWhenReached" in obj, get: obj => obj.removeWhenReached, set: (obj, value) => { obj.removeWhenReached = value; } }, metadata: _metadata }, _removeWhenReached_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _speed_decorators, { kind: "field", name: "speed", static: false, private: false, access: { has: obj => "speed" in obj, get: obj => obj.speed, set: (obj, value) => { obj.speed = value; } }, metadata: _metadata }, _speed_initializers, _instanceExtraInitializers);
                __esDecorate(null, null, _avgIdleTimeSeconds_decorators, { kind: "field", name: "avgIdleTimeSeconds", static: false, private: false, access: { has: obj => "avgIdleTimeSeconds" in obj, get: obj => obj.avgIdleTimeSeconds, set: (obj, value) => { obj.avgIdleTimeSeconds = value; } }, metadata: _metadata }, _avgIdleTimeSeconds_initializers, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                EumlingMovement = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            constructor() {
                super();
                this.targetPosition = (__runInitializers(this, _instanceExtraInitializers), void 0);
                this.removeWhenReached = __runInitializers(this, _removeWhenReached_initializers, true);
                this.speed = __runInitializers(this, _speed_initializers, 1);
                this.avgIdleTimeSeconds = __runInitializers(this, _avgIdleTimeSeconds_initializers, 0);
                if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                    return;
            }
            start() {
                // console.log("start");
            }
            ;
            update(_e) {
                if (this.targetPosition) {
                    if (!this.targetPosition.equals(this.node.mtxWorld.translation, this.speed * 2)) {
                        let difference = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                        difference.normalize((this.speed / 1000) * _e.detail.deltaTime);
                        this.node.mtxLocal.translate(difference, false);
                    }
                    else if (this.removeWhenReached) {
                        this.targetPosition = undefined;
                    }
                }
                else {
                    const standingTime = this.avgIdleTimeSeconds * 1000;
                    if (Math.random() * standingTime < _e.detail.deltaTime) {
                        this.targetPosition = this.getPositionToWalkTo();
                        let diff = ƒ.Vector3.DIFFERENCE(this.targetPosition, this.node.mtxWorld.translation);
                        this.node.mtxLocal.lookIn(diff, ƒ.Vector3.Y(1));
                    }
                }
                // console.log("update");
            }
            ;
            getPositionToWalkTo() {
                let walkNode = this.node.getParent();
                if (!walkNode)
                    return undefined;
                let wa = walkNode.getComponent(Script.WalkableArea);
                if (!wa)
                    return undefined;
                return wa.getPositionInside();
            }
        };
        return EumlingMovement = _classThis;
    })();
    Script.EumlingMovement = EumlingMovement;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class EumlingSpawner extends Script.UpdateScriptComponent {
        constructor() {
            super(...arguments);
            this.spawn = async () => {
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
        update(_e) {
        }
    }
    Script.EumlingSpawner = EumlingSpawner;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    Script.upInput.addEventListener(Script.EVENT_POINTER.LONG, longTap);
    Script.upInput.addEventListener(Script.EVENT_POINTER.SHORT, shortTap);
    function longTap(_e) {
        if (_e.detail.pointer.used)
            return;
        let pickedNode = findFrontPickedObject(_e);
        if (!pickedNode)
            return;
        pickedNode.activate(false);
    }
    function shortTap(_e) {
        if (_e.detail.pointer.used)
            return;
        let pickedNode = findFrontPickedObject(_e);
        if (!pickedNode)
            return;
        let eumlingData = pickedNode.getComponent(Script.EumlingData);
        if (!eumlingData)
            return;
        alert(`You clicked on ${eumlingData.name}`);
    }
    function findFrontPickedObject(_e) {
        const picks = ƒ.Picker.pickViewport(Script.viewport, new ƒ.Vector2(_e.detail.pointer.currentX, _e.detail.pointer.currentY));
        let pickedNodes = [];
        for (let pick of picks) {
            let pickedNode = findPickableNodeInTree(pick.node);
            if (!pickedNode)
                continue;
            pickedNodes.push(pickedNode);
        }
        pickedNodes.sort((a, b) => a.mtxWorld.translation.z - b.mtxWorld.translation.z);
        return pickedNodes.pop();
    }
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
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map