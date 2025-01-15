namespace Script {
    import ƒ = FudgeCore;
    upInput.addEventListener(EVENT_POINTER.LONG, <EventListener>longTap)
    upInput.addEventListener(EVENT_POINTER.SHORT, <EventListener>shortTap)

    function longTap(_e: CustomEvent<UnifiedPointerEvent>) {
        if (_e.detail.pointer.used) return;
        let pickedNode = findFrontPickedObject(_e);
        if (!pickedNode) return;
        pickedNode.getAllComponents()
            .filter(c => !!(<Clickable>c).longTap && c.isActive)
            .forEach(c => (<Clickable>c).longTap(_e.detail.pointer));
    }

    function shortTap(_e: CustomEvent<UnifiedPointerEvent>) {
        if (_e.detail.pointer.used) return;
        let pickedNode = findFrontPickedObject(_e);
        if (!pickedNode) return;

        pickedNode.getAllComponents()
            .filter(c => !!(<Clickable>c).shortTap && c.isActive)
            .forEach(c => (<Clickable>c).shortTap(_e.detail.pointer));
    }

    function findFrontPickedObject(_e: CustomEvent<UnifiedPointerEvent>): ƒ.Node | undefined {
        const picks = ƒ.Picker.pickViewport(viewport, new ƒ.Vector2(_e.detail.pointer.currentX, _e.detail.pointer.currentY));
        let pickedNodes: ƒ.Node[] = [];
        for (let pick of picks) {
            let pickedNode = findPickableNodeInTree(pick.node);
            if (!pickedNode) continue;
            pickedNodes.push(pickedNode);
        }
        pickedNodes.sort((a, b) => a.mtxWorld.translation.z - b.mtxWorld.translation.z);

        return pickedNodes.pop();
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