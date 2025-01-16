namespace Script {
    import ƒ = FudgeCore;
    upInput.addEventListener(EVENT_POINTER.LONG, <EventListener>longTap);
    upInput.addEventListener(EVENT_POINTER.SHORT, <EventListener>shortTap);
    upInput.addEventListener(EVENT_POINTER.START, <EventListener>startTap);

    function longTap(_e: CustomEvent<UnifiedPointerEvent>) {
        if (_e.detail.pointer.used) return;
        let pickedNode = findFrontPickedObject(_e.detail.pointer);
        if (!pickedNode) return;
        pickedNode.getAllComponents()
            .filter(c => !!(<Clickable>c).longTap && c.isActive)
            .forEach(c => (<Clickable>c).longTap(_e.detail.pointer));
    }

    function shortTap(_e: CustomEvent<UnifiedPointerEvent>) {
        if (_e.detail.pointer.used) return;
        let pickedNode = findFrontPickedObject(_e.detail.pointer);
        if (!pickedNode) return;

        pickedNode.getAllComponents()
            .filter(c => !!(<Clickable>c).shortTap && c.isActive)
            .forEach(c => (<Clickable>c).shortTap(_e.detail.pointer));
    }

    function startTap(_e: CustomEvent<UnifiedPointerEvent>) {
        let frontEumling = findAllPickedObjects(_e.detail.pointer).filter(n => n.getComponent(EumlingMovement)).sort(sortByDistance).pop();
        if(frontEumling){
            frontEumling.getComponent(EumlingMovement).stopMoving();
        }
    }

    export function findFrontPickedObject(_p: Pointer): ƒ.Node | undefined {
        let pickedNodes = findAllPickedObjects(_p);
        pickedNodes.sort(sortByDistance);

        return pickedNodes.pop();
    }

    function sortByDistance(a: ƒ.Node, b: ƒ.Node) {
        return a.mtxWorld.translation.z - b.mtxWorld.translation.z;
    }

    export function findAllPickedObjects(_pointer: Pointer): ƒ.Node[] {
        const picks = ƒ.Picker.pickViewport(viewport, new ƒ.Vector2(_pointer.currentX, _pointer.currentY));
        let pickedNodes: ƒ.Node[] = [];
        for (let pick of picks) {
            let pickedNode = findPickableNodeInTree(pick.node);
            if (!pickedNode) continue;
            pickedNodes.push(pickedNode);
        }
        return pickedNodes;
    }

    function findPickableNodeInTree(node: ƒ.Node): ƒ.Node | undefined {
        if (!node) return undefined;
        let pick = node.getComponent(ƒ.ComponentPick);
        if (pick) return node;
        return findPickableNodeInTree(node.getParent());
    }

    export interface Clickable {
        shortTap?(_pointer: Pointer): void;
        longTap?(_pointer: Pointer): void;
    }
}