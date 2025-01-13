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
        short: boolean,
        used?: boolean,
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
    const timeUntilLongClickMS = 500;
    const maxDistanceForLongClick = 20;
    export class UnifiedPointerInput extends EventTarget {
        private pointers: Map<number, Pointer> = new Map();

        initialize(_element: HTMLElement): void {
            console.log("init");
            _element.addEventListener("pointerdown", <EventListener>this.hndPointerDown);
            _element.addEventListener("pointerup", <EventListener>this.hndPointerUp);
            _element.addEventListener("pointercancel", <EventListener>this.hndPointerUp);
            _element.addEventListener("pointermove", <EventListener>this.hndPointerMove);
        }


        private hndPointerDown = (_event: PointerEvent) => {
            let existingPointer = this.getPointer(_event.pointerId);
            if (!existingPointer)
                existingPointer = this.createPointerFromPointer(_event);
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START, { detail: { pointer: existingPointer } }));
        }
        private hndPointerUp = (_event: PointerEvent) => {
            let existingPointer = this.getPointer(_event.pointerId);
            if (existingPointer) {
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.CHANGE, { detail: { pointer: existingPointer } }));
                this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.END, { detail: { pointer: existingPointer } }));
                if (existingPointer.short)
                    this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.SHORT, { detail: { pointer: existingPointer } }));
                clearTimeout(existingPointer.longTapTimeout);
                this.pointers.delete(existingPointer.id);
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
                existingPointer.short = false;
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
                short: true,
                longTapTimeout: setTimeout(() => {
                    this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.LONG, { detail: { pointer: pointer } }));
                    pointer.short = false;
                }, timeUntilLongClickMS),
            }
            this.pointers.set(pointer.id, pointer);

            this.dispatchEvent(new CustomEvent<UnifiedPointerEvent>(EVENT_POINTER.START, { detail: { pointer } }));
            return pointer;
        }

        public get pointerList(): Pointer[] {
            return Array.from(this.pointers, ([, pointer]) => (pointer));
        }
    }
}