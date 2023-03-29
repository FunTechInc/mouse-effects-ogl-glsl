import * as THREE from "three";
import { Pane } from "tweakpane";
import HiddenThreeUtils from "./HiddenThreeUtils";
import myFragmentShader from "./glsl/mainfog.frag";
import { LimitFrameRate } from "./LimitFrameRate";

/*===============================================
plane geo
===============================================*/

export default class MainFog extends HiddenThreeUtils {
    constructor(el, opt, gParams) {
        super(el, opt);
        this.material = false;
        this.canvasSize = {
            width:this.el.clientWidth,
            height:this.el.clientHeight,
        }
        this.limitFrameRate = new LimitFrameRate(60);
        this.rAFID = 0;
        this.gParams = {
            n1Color: [
                gParams?.maxColor?.c0 || { r: 255, g: 87, b: 51 },
            ],
            n2Color: [
                gParams?.maxColor?.c0 || { r: 87, g: 24, b: 69 },
            ],
            n3Color: [
                gParams?.maxColor?.c0 || { r: 199, g: 0, b: 57 },
            ],
        }

    }
    createMesh() {
        const getRgbfromParams = (colorArr, index) => {
         return new THREE.Color(
            `rgb(${this.gParams[colorArr][index].r}, ${this.gParams[colorArr][index].g}, ${this.gParams[colorArr][index].b})`
         );
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uResolution: {
                    value: new THREE.Vector2(this.canvasSize.width, this.canvasSize.height),
                },
                uTime: { value: 0 },
                n1Color: {
                     value: getRgbfromParams("n1Color", 0),
                },
                n2Color: {
                     value: getRgbfromParams("n2Color", 0),
                },
                n3Color: {
                     value: getRgbfromParams("n3Color", 0),
                },
                uLight: { value: 1.0 },
                uNoise: { value: 0.3 },
            },
            fragmentShader: myFragmentShader,
        });
        let plane = new THREE.PlaneGeometry( this.canvasSize.width, this.canvasSize.height );
        this.object = new THREE.Mesh( plane, this.material );
        this.scene.add( this.object );
    }
    /*===============================================
	initial
	===============================================*/
   init() {
      this.createMesh();
      this.play();
      this.setGUI();
    }
   pause() {
      cancelAnimationFrame(this.rAFID);
    }
   play() {
      const rendering = (timestamp) => {
        if (this.limitFrameRate.isLimitFrames(timestamp)) {
            this.rAFID = requestAnimationFrame(rendering);
            return;
        }
        this.rAFID = requestAnimationFrame(rendering);
        this.update();
      };
      this.rAFID = requestAnimationFrame(rendering);
    }

    update() {
        if (this.state.clock) {
         this.state.time = this.state.clock.getElapsedTime();
      } else {
         this.state.clock = new THREE.Clock();
      }

      let time = this.state.time;
      this.material.uniforms.uTime.value = time;

      this.renderer.render( this.scene, this.camera );

   }
   /*===============================================
	GUI
	===============================================*/
   setGUI() {
      const pane = new Pane({
         container: document.getElementById("gui"),
      });
      const PARAMS = {
         n1Color: {
            r: this.gParams.n1Color[0].r,
            g: this.gParams.n1Color[0].g,
            b: this.gParams.n1Color[0].b,
         },
         n2Color: {
            r: this.gParams.n2Color[0].r,
            g: this.gParams.n2Color[0].g,
            b: this.gParams.n2Color[0].b,
         },
         n3Color: {
            r: this.gParams.n3Color[0].r,
            g: this.gParams.n3Color[0].g,
            b: this.gParams.n3Color[0].b,
         },
         light: 1.0,
         noise: 0.3,
         pause: false,
      };
      //folder
      const n1folder = pane.addFolder({
         title: "n1 color",
         expanded: false,
      });
      const n2folder = pane.addFolder({
         title: "n2 color",
         expanded: false,
      });
      const n3folder = pane.addFolder({
         title: "n3 color",
         expanded: false,
      });
      //color
      const updateGuiColor = (obj) => {
         return new THREE.Color(
            `rgb(${Math.floor(obj.r)},${Math.floor(obj.g)},${Math.floor(
               obj.b
            )})`
         );
      };
      n1folder
         .addInput(PARAMS, "n1Color", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.n1Color.value = updateGuiColor(v.value);
         });
      n2folder
         .addInput(PARAMS, "n2Color", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.n2Color.value = updateGuiColor(v.value);
         });
      n3folder
         .addInput(PARAMS, "n3Color", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.n3Color.value = updateGuiColor(v.value);
         });   
      pane.addInput(PARAMS, "light", { min: 0, max: 1 }).on("change", (v) => {
         this.material.uniforms.uLight.value = v.value;
      }); 
      pane.addInput(PARAMS, "noise", { min: 0.0, max: 0.5 }).on("change", (v) => {
         this.material.uniforms.uNoise.value = v.value;
      });   
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

