namespace Script {
    import ƒ = FudgeCore;
    export interface Pointer {
        id: number,
        startX: number,
        startY: number,
        currentX: number,
        currentY: number,
        startTime: number,
        type: string,
        longTapTimeout: number,
        tapType: "none" | "short" | "long" | "drag",
        used?: boolean,
        ended?: boolean,
    }
    export enum EVENT_POINTER {
        /** A pointer enters the html element */
        START = "pointerstart",
        /** A pointer exits the html element */
        END = "pointerend",
        /** A pointer changes, either its pressed/touched status or its position */
        CHANGE = "pointerchange",
        /** A pointer is pressed and released faster than the threshold for a long tap */
        SHORT = "pointershort",
        /** A pointer is pressed/touched for a longer time. */
        LONG = "pointerlong",
    }
    export interface UnifiedPointerEvent {
        pointer: Pointer,
    }
    const timeUntilLongClickMS = 200;
    const maxDistanceForLongClick = 100;
    export class UnifiedPointerInput extends EventTarget {
        private pointers: Map<number, Pointer> = new Map();

        initialize(_element: HTMLElement): void {
            console.log("init");
            _element.addEventListener("pointerdown", <EventListener>this.hndPointerDown);
            _element.addEventListener("pointerup", <EventListener>this.hndPointerUp);
            _element.addEventListener("pointercancel", <EventListener>this.hndPointerUp);
            _element.addEventListener("pointermove", <EventListener>this.hndPointerMove);

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


        private hndPointerDown = (_event: PointerEvent) => {
            let existingPointer = this.getPointer(_event.pointerId);
            if (!existingPointer)
                existingPointer = this.createPointerFromPointer(_event);
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START, { detail: { pointer: existingPointer } }));
            // console.log("pointer down");
        }
        private hndPointerUp = (_event: PointerEvent) => {
            let existingPointer = this.getPointer(_event.pointerId);
            if (existingPointer) {
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                if (existingPointer.tapType === "none"){
                    existingPointer.tapType = "short";
                    this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.SHORT, { detail: { pointer: existingPointer } }));
                }
                clearTimeout(existingPointer.longTapTimeout);
                existingPointer.ended = true;
                this.pointers.delete(existingPointer.id);
                // console.log("pointer up");
            }
        }
        private hndPointerMove = (_event: PointerEvent) => {
            let existingPointer = this.getPointer(_event.pointerId);
            if (!existingPointer)
                return;
            existingPointer.currentX = _event.clientX;
            existingPointer.currentY = _event.clientY;
            if (
                existingPointer.longTapTimeout && (
                    Math.abs(existingPointer.currentX - existingPointer.startX) > maxDistanceForLongClick ||
                    Math.abs(existingPointer.currentY - existingPointer.startY) > maxDistanceForLongClick
                )
            ) {
                clearTimeout(existingPointer.longTapTimeout);
                existingPointer.tapType = "drag";
            }
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
        }

        private getPointer(_id: number): Pointer | undefined {
            return this.pointers.get(_id);
        }

        private createPointerFromPointer(_event: PointerEvent): Pointer {
            let pointer: Pointer = {
                id: _event.pointerId,
                currentX: _event.clientX,
                currentY: _event.clientY,
                startX: _event.clientX,
                startY: _event.clientY,
                startTime: ƒ.Time.game.get(),
                type: _event.pointerType,
                tapType: "none",
                longTapTimeout: setTimeout(() => {
                    this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.LONG, { detail: { pointer: pointer } }));
                    pointer.tapType = "long";
                }, timeUntilLongClickMS),
            }
            this.pointers.set(pointer.id, pointer);

            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START, { detail: { pointer } }));
            return pointer;
        }

        private preventDefaults(_e: Event) {
            _e.preventDefault();
            _e.stopPropagation();
        }

        public get pointerList(): Pointer[] {
            return Array.from(this.pointers, ([, pointer]) => (pointer));
        }

    }
}