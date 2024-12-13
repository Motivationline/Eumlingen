/// <reference path="UnifiedPointerInput.ts"/>

namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  const upInput = new UnifiedPointerInput();

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // runs updates of all updateable components
    UpdateScriptComponent.updateAllInBranch(viewport.getBranch());

    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();

    if(gameMode){
      // console.log(upInput.pointerList.length);
      moveCamera(upInput.pointerList);
    }
  }

  let camera: ƒ.ComponentCamera;
  let gameMode: boolean = false;
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
    let canvas = document.querySelector("canvas");
    let viewport = new ƒ.Viewport();
    camera = findFirstCameraInGraph(graph);

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

  function moveCamera(_pointers: Pointer[]) {
    let direction: number = 0;
    for (let pointer of _pointers) {
      if (pointer.currentX < window.innerWidth * 0.1) {
        direction += 1;
      } else if (pointer.currentX > window.innerWidth * 0.9) {
        direction -= 1;
      }
    }
    direction *= 0.1;
    camera.mtxPivot.translateX(direction);
  }


  window.addEventListener("load", init);
  function init() {
    for (let el of <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("start-button")) {
      el.addEventListener("click", startViewport);
    }
  }
}