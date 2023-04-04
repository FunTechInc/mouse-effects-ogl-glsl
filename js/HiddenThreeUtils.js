import * as THREE from "three";

export default class HiddenThreeUtils {
   constructor(el, opt) {
      this.el = el;
      if (!this.el) return;
      this.opt = opt || {};

      //debug mode
      this.axis = this.opt?.debug?.axis || false;
      this.controls = this.opt?.debug?.controls || false;

      //state
      this.state = {
         width: null,
         height: null,
         clock: null,
         time: 0,
         resizeTimeoutID: 0,
      };
      this.updateSize();

      //camera fov
      this.fov = 60;
      this.fovRad = (this.fov / 2) * (Math.PI / 180);
      this.fovDist = this.state.height / 2 / Math.tan(this.fovRad);

      //setup
      this.setup();
   }

   setup() {
      // scene init
      this.scene = new THREE.Scene();

      // camera init
      this.camera = new THREE.PerspectiveCamera(
         this.fov,
         this.state.width / this.state.height,
         0.1,
         this.fovDist * 4
      );

      // renderer init
      const clearColor = this.opt?.clearColor || 0xffffff;
      const clearAlpha = this.opt?.clearAlpha || 0.0;
      this.renderer = new THREE.WebGLRenderer({
         alpha: this.opt?.alpha || false,
         antialias: this.opt?.antialias || false,
         depth: this.opt?.depth || false,
         stencil: false,
         // autoClearColor: false,
         // autoClear: false,
         // autoClearDepth: false,
      });

      this.renderer.setClearColor(clearColor, clearAlpha);
      // this.renderer.autoClear = false;
      // this.renderer.autoClearColor = false;
      // this.renderer.autoClearDepth = false;


      //size init
      this.updateRenderer();
      window.addEventListener("resize", () => {
         clearTimeout(this.state.resizeTimeoutID);
         this.state.resizeTimeoutID = setTimeout(() => {
            this.updateSize();
            this.updateRenderer();
         }, 100);
      });

      // add to dom
      const canvas = this.renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      this.el.appendChild(this.renderer.domElement);

      // debug mode
      if (this.axis) {
         this.scene.add(
            new THREE.AxesHelper(
               Math.min(this.state.width, this.state.height) / 4
            )
         );
      }
      // if (this.controls) {
      //    this.controls = new OrbitControls(
      //       this.camera,
      //       this.renderer.domElement
      //    );
      // }
   }

   //update state width/height
   updateSize() {
      const rect = this.el.getBoundingClientRect();
      this.state.width = rect.width;
      this.state.height = rect.height;
   }

   //update renderer
   updateRenderer() {
      //set camera
      this.camera.aspect = this.state.width / this.state.height;
      this.camera.position.z = this.state.height / 2 / Math.tan(this.fovRad);
      this.camera.updateProjectionMatrix();
      //set renderer
      // this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.state.width, this.state.height);
   }

   //render
   render() {
      // this.renderer.autoClear = false;
      this.renderer.render(this.scene, this.camera);
      this.controls && this.controls.update();
      //clock
      if (this.state.clock) {
         this.state.time = this.state.clock.getElapsedTime();
      } else {
         this.state.clock = new THREE.Clock();
      }
   }

   //destroy
   destroy() {
      this.el.removeChild(this.renderer.domElement);
   }
}
