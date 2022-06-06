import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  Vector3,
  FreeCamera,
  HemisphericLight,
  WebXRHitTest,
  MeshBuilder,
  Quaternion,
} from "@babylonjs/core";
import VConsole from "vconsole";

new VConsole({ theme: "dark" });

class App {
  constructor() {
    // create the canvas html element and attach it to the webpage
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    const engine = new Engine(canvas, true);

    this.setup(engine);
  }

  async setup(engine: Engine) {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    const camera = new FreeCamera("camera", new Vector3(0, 1, -5), scene);
    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // This attaches the camera to the canvas
    camera.attachControl(engine.getRenderingCanvas(), true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
      },
      optionalFeatures: true,
    });

    const fm = xr.baseExperience.featuresManager;

    const xrTest = fm.enableFeature(WebXRHitTest, "latest");

    const marker = MeshBuilder.CreateTorus("marker", {
      diameter: 0.15,
      thickness: 0.05,
    });
    marker.isVisible = false;
    marker.rotationQuaternion = new Quaternion();

    // @ts-ignore
    xrTest.onHitTestResultObservable.add((results) => {
      if (results.length) {
        marker.isVisible = true;
        // @ts-ignore
        const hitTest = results[0];
        // @ts-ignore
        hitTest.transformationMatrix.decompose(
          marker.scaling,
          marker.rotationQuaternion,
          marker.position
        );
      } else {
        marker.isVisible = false;
      }
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}

new App();
