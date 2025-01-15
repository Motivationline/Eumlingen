namespace Script {
    import ƒ = FudgeCore;
    upInput.addEventListener(EVENT_POINTER.LONG, <EventListener>longTap)
    upInput.addEventListener(EVENT_POINTER.SHORT, <EventListener>shortTap)

    function longTap(_e: CustomEvent<UnifiedPointerEvent>) {
        if (_e.detail.pointer.used) return;
        let pickedNode = findFrontPickedObject(_e);
        if (!pickedNode) return;
        pickedNode.activate(false);

    }

    function shortTap(_e: CustomEvent<UnifiedPointerEvent>) {
        if (_e.detail.pointer.used) return;
        let pickedNode = findFrontPickedObject(_e);
        if (!pickedNode) return;

        let eumlingData = pickedNode.getComponent(EumlingData);
        if (eumlingData) {
            showEumling(eumlingData);
        }
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

    function showEumling(data: EumlingData) {
        data.node.addComponent(eumlingCamera);
        eumlingViewport.setBranch(data.node);
        let infoOverlay = document.getElementById("eumling-info-overlay");
        (<HTMLElement>infoOverlay.querySelector("#eumling-name")).innerText = data.name;
        showLayer(infoOverlay, { onRemove: () => { eumlingCameraActive = false; }, onAdd: () => { eumlingCameraActive = true } });

        data.node.getComponent(EumlingAnimator).overlayAnimation(EumlingAnimator.ANIMATIONS.CLICKED_ON);
    }
}