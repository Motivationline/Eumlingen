namespace Script {
    import ƒ = FudgeCore;
    export interface Pointer {
        id: number,
        startX: number,
        startY: number,
        currentX: number,
        currentY: number,
        startTime: number,
        pressed: boolean,
        type: "mouse" | "touch",
    }
    export enum EVENT_POINTER {
        /** A pointer enters the html element */
        START = "pointerstart",
        /** A pointer starts being pressed / touched */
        START_TOUCH = "pointerstarttouch",
        /** A pointer exits the html element */
        END = "pointerend",
        /** A pointer ends being pressed / touched */
        END_TOUCH = "pointerendtouch",
        /** A pointer changes, either its pressed/touched status or its position */
        CHANGE = "pointerchange",
        /** A pointer is pressed/touched for a longer time. NOT IMPLEMENTED YET */
        // LONG = "pointerlong",
    }
    export interface UnifiedPointerEvent {
        pointer: Pointer,
    }
    export class UnifiedPointerInput extends EventTarget {
        private pointers: Map<number, Pointer> = new Map();
        //assuming only one mouse exists at a time and touches only have positive ids
        private mouseId: number = -99;

        initialize(_element: HTMLElement): void {
            console.log("init");
            _element.addEventListener("touchstart", <EventListener>this.hndTap)
            _element.addEventListener("touchmove", <EventListener>this.hndTap)
            _element.addEventListener("touchend", <EventListener>this.hndTapEnd)
            _element.addEventListener("touchcancel", <EventListener>this.hndTapEnd)

            _element.addEventListener("mouseenter", <EventListener>this.hndMouseEnter)
            _element.addEventListener("mousemove", <EventListener>this.hndMouseMove)
            _element.addEventListener("mouseleave", <EventListener>this.hndMouseLeave)
            _element.addEventListener("mousedown", <EventListener>this.hndMouseDown)
            _element.addEventListener("mouseup", <EventListener>this.hndMouseUp)
        }

        private hndTap = (_event: TouchEvent) => {
            let changedTouches = _event.changedTouches;
            if (!changedTouches || changedTouches.length == 0) return;
            for (let touch of changedTouches) {
                let existingPointer = this.getPointer(touch.identifier);
                if (!existingPointer)
                    existingPointer = this.createPointerFromTouch(touch);
                existingPointer.currentX = touch.clientX;
                existingPointer.currentY = touch.clientY;
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            }
        }

        private hndTapEnd = (_event: TouchEvent) => {
            let changedTouches = _event.changedTouches;
            if (!changedTouches || changedTouches.length == 0) return;
            for (let touch of changedTouches) {
                let existingPointer = this.getPointer(touch.identifier);
                if (existingPointer) {
                    this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                    this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END_TOUCH, { detail: { pointer: existingPointer } }));
                    this.pointers.delete(touch.identifier);
                }
            }
        }

        private hndMouseEnter = (_event: MouseEvent) => {
            let existingPointer = this.getPointer(this.mouseId);
            if (!existingPointer)
                existingPointer = this.createPointerFromMouse(_event);
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
        }
        private hndMouseMove = (_event: MouseEvent) => {
            let existingPointer = this.getPointer(this.mouseId);
            if (!existingPointer)
                existingPointer = this.createPointerFromMouse(_event);
            existingPointer.currentX = _event.clientX;
            existingPointer.currentY = _event.clientY;
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
        }
        private hndMouseLeave = (_event: MouseEvent) => {
            let existingPointer = this.getPointer(this.mouseId);
            if (existingPointer) {
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END_TOUCH, { detail: { pointer: existingPointer } }));
                this.pointers.delete(existingPointer.id);
            }
        }
        private hndMouseDown = (_event: MouseEvent) => {
            let existingPointer = this.getPointer(this.mouseId);
            if (!existingPointer)
                existingPointer = this.createPointerFromMouse(_event);
            existingPointer.pressed = true;
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START_TOUCH, { detail: { pointer: existingPointer } }));
        }
        private hndMouseUp = (_event: MouseEvent) => {
            let existingPointer = this.getPointer(this.mouseId);
            if (!existingPointer)
                existingPointer = this.createPointerFromMouse(_event);
            existingPointer.pressed = false;
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END_TOUCH, { detail: { pointer: existingPointer } }));
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
        }

        private getPointer(_id: number): Pointer | undefined {
            return this.pointers.get(_id);
        }

        private createPointerFromTouch(_touch: Touch): Pointer {
            let pointer: Pointer = {
                id: _touch.identifier,
                currentX: _touch.clientX,
                currentY: _touch.clientY,
                startX: _touch.clientX,
                startY: _touch.clientY,
                startTime: ƒ.Time.game.get(),
                pressed: true,
                type: "touch",
            }
            this.pointers.set(_touch.identifier, pointer);

            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START, { detail: { pointer } }));
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START_TOUCH, { detail: { pointer } }));
            return pointer;
        }
        private createPointerFromMouse(_event: MouseEvent): Pointer {
            let pointer: Pointer = {
                id: this.mouseId,
                currentX: _event.clientX,
                currentY: _event.clientY,
                startX: _event.clientX,
                startY: _event.clientY,
                startTime: ƒ.Time.game.get(),
                pressed: false,
                type: "mouse",
            }
            this.pointers.set(this.mouseId, pointer);

            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START, { detail: { pointer } }));
            return pointer;
        }

        public get pointerList(): Pointer[] {
            return Array.from(this.pointers, ([, pointer]) => (pointer));
        }
    }
}