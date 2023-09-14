import * as THREE from "three";
import { Pane } from "tweakpane";
import HiddenThreeUtils from "./HiddenThreeUtils";
import myFragmentShader from "./glsl/main.frag";
import myVertexShader from "./glsl/main.vert";

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
      //geomatry
      let geometry = new THREE.PlaneGeometry(innerWidth/2,innerHeight*0.7);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      //object3D
      const plane = new THREE.Mesh(geometry, material);
      this.scene.add(plane);
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
      // this.material.uniforms.uTime.value = time;
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
