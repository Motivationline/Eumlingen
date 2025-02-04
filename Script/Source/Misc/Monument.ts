namespace Script {
    import ƒ = FudgeCore;
    export class Monument extends ƒ.Component implements Clickable {
        shortTap(_pointer: Pointer): void {
            globalEvents.dispatchEvent(new CustomEvent<GlobalEventData>("event", { detail: { type: "clickStatue", data: { statue: this.node } } }));
        }
    }
}