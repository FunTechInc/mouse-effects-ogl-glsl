import * as THREE from "three";
import { Pane } from "tweakpane";
import HiddenThreeUtils from "./HiddenThreeUtils";

/*===============================================
WebGL
===============================================*/
export default class WebGL extends HiddenThreeUtils {
   constructor(el, opt) {
      super(el, opt);
      //material
      this.material;
      //rAF ID
      this.rAFID = 0;
   }
   /*===============================================
	メッシュの生成
	===============================================*/
   createMesh() {
    //   geomatry
    //   let geometry = new THREE.BufferGeometry();
    //   object3D
    //   const points = new THREE.Points(geometry, this.material);
    //   this.scene.add(points);
   }
   /*===============================================
	initial
	===============================================*/
   init() {
      //setup mesh
      this.createMesh();
      this.setGUI();
      //start rendering
      this.play();
   }
   /*===============================================
	pause & play
	===============================================*/
   pause() {
      cancelAnimationFrame(this.rAFID);
   }
   play() {
      const rendering = () => {
         this.render();
         this.update();
         this.rAFID = requestAnimationFrame(rendering);
      };
      this.rAFID = requestAnimationFrame(rendering);
   }
   /*===============================================
	update timer
	===============================================*/
   update() {
      let time = this.state.time;
      this.material.uniforms.uTime.value = time;
   }
   /*===============================================
	GUI
	===============================================*/
   setGUI() {
      const pane = new Pane({
         container: document.getElementById("gui"),
      });
      const PARAMS = {
         pause: false,
      };
      //pause
      pane.addInput(PARAMS, "pause").on("change", (v) => {
         if (v.value === true) {
            this.pause();
         } else {
            this.play();
         }
      });
   }
}
