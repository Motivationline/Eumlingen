/// <reference path="UnifiedPointerInput.ts"/>

namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  export const upInput = new UnifiedPointerInput();
  export let eumlingCameraActive: boolean = false;
  export const gravity: number = 1;

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // runs updates of all updateable components
    UpdateScriptComponent.updateAllInBranch(viewport.getBranch());

    // ƒ.Physics.simulate();  // if physics is included and used
    // viewport.draw();
    ƒ.AudioManager.default.update();
    
    if (eumlingCameraActive) {
      eumlingViewport.draw();
    } else {
      viewport.draw();
    }
    if (gameMode) {
      // console.log(upInput.pointerList.length);
      moveCamera(upInput.pointerList);
    }
  }

  let camera: ƒ.ComponentCamera;
  let gameMode: boolean = false;
  export const eumlingCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
  export const eumlingViewport = new ƒ.Viewport();
  async function startViewport(_event: MouseEvent) {
    document.getElementById("start-screen").remove();
    let graphId/* : string */ = document.head.querySelector("meta[autoView]").getAttribute("autoView")
    if ((<HTMLElement>_event.target).id === "freecam") {
      //@ts-ignore
      return window.startInteractiveViewport(graphId);
    }
    gameMode = true;
    await ƒ.Project.loadResourcesFromHTML();
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources[graphId];
    let canvas = <HTMLCanvasElement>document.getElementById("game-canvas");
    let viewport = new ƒ.Viewport();
    camera = findFirstCameraInGraph(graph);

    viewport.initialize("GameViewport", graph, camera, canvas);

    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));

    upInput.initialize(document.getElementById("game-canvas"));
    // upInput.addEventListener(EVENT_POINTER.START, _e => console.log(EVENT_POINTER.START, (<CustomEvent>_e).detail, upInput.pointerList.length))
    // upInput.addEventListener(EVENT_POINTER.END, _e => console.log(EVENT_POINTER.END, (<CustomEvent>_e).detail, upInput.pointerList.length))
    // upInput.addEventListener(EVENT_POINTER.CHANGE, _e => console.log(EVENT_POINTER.CHANGE, (<CustomEvent>_e).detail, upInput.pointerList.length))
    // upInput.addEventListener(EVENT_POINTER.LONG, _e => console.log(EVENT_POINTER.LONG, (<CustomEvent>_e).detail, upInput.pointerList.length))

    eumlingViewport.initialize("EumlingViewport", null, eumlingCamera, <HTMLCanvasElement>document.getElementById("eumling-canvas"));
    eumlingCamera.mtxPivot.translateZ(3);
    eumlingCamera.mtxPivot.translateY(1);
    eumlingCamera.mtxPivot.rotateY(180);
    eumlingCamera.clrBackground = new ƒ.Color(1, 1, 1, 0.1);
  }

  let currentCameraSpeed: number = 0;
  const maxCameraSpeed: number = 10;
  const timeUntilFullSpeed: number = 2;
  const cameraAcelleration: number = maxCameraSpeed / timeUntilFullSpeed;
  const cameraBoundaryX: [number, number] = [-7, -2];
  function moveCamera(_pointers: Pointer[]) {
    let speed: number = 0;
    for (let pointer of _pointers) {
      if (pointer.currentX < window.innerWidth * 0.1) {
        pointer.used = true;
        speed -= 1;
      } else if (pointer.currentX > window.innerWidth * 0.9) {
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
    for (let el of <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("start-button")) {
      el.addEventListener("click", startViewport);
    }
    document.getElementById("eumlingSpawn").addEventListener("click", () => {
      viewport.getBranch().broadcastEvent(new Event("spawnEumling"));
    })
  }


}