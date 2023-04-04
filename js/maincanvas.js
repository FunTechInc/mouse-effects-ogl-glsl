import * as THREE from "three";
import { Pane } from "tweakpane";
import HiddenThreeUtils from "./HiddenThreeUtils";
import myFragmentShader from "./glsl/maincanvas.frag";
import { LimitFrameRate } from "./LimitFrameRate";

/*===============================================
plane geo
===============================================*/

export default class MainCanvas extends HiddenThreeUtils {
    constructor(el, opt, gParams) {
        super(el, opt);
        this.material = false;
        this.canvasSize = {
            width:this.el.clientWidth,
            height:this.el.clientHeight,
        }
        this.pointer = new THREE.Vector2();
        this.onPointerMove = this.onPointerMove.bind(this);
        this.rAFID = 0;
        this.gParams = {
            scale: gParams?.scale || 0.1,
            light: gParams?.light || 1.0,
            noise: gParams?.noise || 0.3,
            alpha: gParams?.alpha || 0.5,
            nColors: [
               gParams?.nColors?.c0 || { r: 0, g: 0, b: 0 },
               gParams?.nColors?.c1 || { r: 0, g: 0, b: 0 },
               gParams?.nColors?.c2 || { r: 0, g: 0, b: 0 },
            ],
        }

    }
    onPointerMove( event ) {
	    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    createMesh() {
        this.bufferScene = new THREE.Scene();
        const getRgbfromParams = (colorArr, index) => {
         return new THREE.Color(
            `rgb(${this.gParams[colorArr][index].r}, ${this.gParams[colorArr][index].g}, ${this.gParams[colorArr][index].b})`
         );
        };
        this.textureA = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
         });
        this.textureB = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
         });
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                bufferTexture: { 
                    value: this.textureA 
                },
                uResolution: {
                    value: new THREE.Vector2(this.canvasSize.width, this.canvasSize.height),
                },
			       uTouch: {
                    value: this.pointer,
                },
                uTime: { value: 0 },
                nColor0: {
                  value: getRgbfromParams("nColors", 0),
               },
               nColor1: {
                  value: getRgbfromParams("nColors", 1),
               },
               nColor2: {
                  value: getRgbfromParams("nColors", 2),
               },
                uBlur: { value: 1.0 },
                uScale: { value: this.gParams.scale },
                uLight: { value: this.gParams.light },
                uNoise: { value: this.gParams.noise },
                uAlpha: { value: this.gParams.alpha },
            },
            fragmentShader: myFragmentShader,
            // transparent: true,
        });
        let plane = new THREE.PlaneGeometry( this.canvasSize.width, this.canvasSize.height );
        this.object = new THREE.Mesh( plane, this.material );
        this.bufferScene.add( this.object );
        this.finalMaterial = new THREE.MeshBasicMaterial({map: this.textureB.texture,transparent: true });
        this.quad = new THREE.Mesh( plane, this.finalMaterial );
        this.scene.add(this.quad); 
    }
    /*===============================================
	initial
	===============================================*/
   init() {
      this.createMesh();
      window.addEventListener("mousemove", this.onPointerMove);
      this.play();
      this.setGUI();
    }
   pause() {
      cancelAnimationFrame(this.rAFID);
    }
   play(fps = 10) {
      const limitFrames = new LimitFrameRate(fps);
      const rendering = (timestamp) => {
        if (limitFrames.isLimitFrames(timestamp)) {
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

      // let pointer = this.pointer;
      // this.material.uniforms.uTouch.value = pointer;

      this.renderer.setRenderTarget(this.textureB);
      this.renderer.render(this.bufferScene, this.camera);
      this.renderer.setRenderTarget(null);

      let t = this.textureA;
      this.textureA = this.textureB;
      this.textureB = t;
      this.quad.material.map = this.textureB.texture;
      this.material.uniforms.bufferTexture.value = this.textureA.texture;

      let time = this.state.time;
      this.material.uniforms.uTime.value = time;

      this.renderer.render( this.scene, this.camera );
   }
   // updateColors(newColor0, newColor1, newColor2){
   //      this.gParams.nColors[0].r = newColor0.r;
   //      this.gParams.nColors[0].g = newColor0.g;
   //      this.gParams.nColors[0].b = newColor0.b;

   //      this.gParams.nColors[1].r = newColor1.r;
   //      this.gParams.nColors[1].g = newColor1.g;
   //      this.gParams.nColors[1].b = newColor1.b;

   //      this.gParams.nColors[2].r = newColor2.r;
   //      this.gParams.nColors[2].g = newColor2.g;
   //      this.gParams.nColors[2].b = newColor2.b;

   //      this.material.uniforms.nColor0.value = new THREE.Color(newColor0.r, newColor0.g, newColor0.b);
   //      this.material.uniforms.nColor1.value = new THREE.Color(newColor1.r, newColor1.g, newColor1.b);
   //      this.material.uniforms.nColor2.value = new THREE.Color(newColor2.r, newColor2.g, newColor2.b);
   // }

   /*===============================================
	GUI
	===============================================*/
   setGUI() {
      const pane = new Pane({
         container: document.getElementById("gui"),
      });
      const PARAMS = {
         nColor0: {
            r: this.gParams.nColors[0].r,
            g: this.gParams.nColors[0].g,
            b: this.gParams.nColors[0].b,
         },
         nColor1: {
            r: this.gParams.nColors[1].r,
            g: this.gParams.nColors[1].g,
            b: this.gParams.nColors[1].b,
         },
         nColor2: {
            r: this.gParams.nColors[2].r,
            g: this.gParams.nColors[2].g,
            b: this.gParams.nColors[2].b,
         },
         scale: this.gParams.scale,
         light: this.gParams.light,
         noise: this.gParams.noise,
         alpha: this.gParams.alpha,
         pause: false,
      };
      //folder
      const nfolder = pane.addFolder({
         title: "noise colors",
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
      nfolder
         .addInput(PARAMS, "nColor0", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.nColor0.value = updateGuiColor(v.value);
         });
      nfolder
         .addInput(PARAMS, "nColor1", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.nColor1.value = updateGuiColor(v.value);
         });
      nfolder
         .addInput(PARAMS, "nColor2", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.nColor2.value = updateGuiColor(v.value);
         }); 
      pane.addInput(PARAMS, "scale", { min: 0.1, max: 0.5 }).on("change", (v) => {
         this.material.uniforms.uScale.value = v.value;
      });
      pane.addInput(PARAMS, "light", { min: 0, max: 1 }).on("change", (v) => {
         this.material.uniforms.uLight.value = v.value;
      }); 
      pane.addInput(PARAMS, "noise", { min: 0.0, max: 1.0 }).on("change", (v) => {
         this.material.uniforms.uNoise.value = v.value;
      });
      pane.addInput(PARAMS, "alpha", { min: 0.0, max: 1.0 }).on("change", (v) => {
         this.material.uniforms.uAlpha.value = v.value;
      });     
      //blur
      // pane.addInput(PARAMS, "blur", { min: 1, max: 3 }).on("change", (v) => {
      //    this.material.uniforms.uBlur.value = v.value;
      // });   
      
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

