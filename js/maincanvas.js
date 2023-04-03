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
        this.limitFrameRate = new LimitFrameRate(60);
        this.rAFID = 0;
        this.gParams = {
            minColor: [
                gParams?.minColor?.c0 || { r: 255, g: 255, b: 255 },
            ],
            maxColor: [
                gParams?.maxColor?.c0 || { r: 0, g: 0, b: 255 },
            ],
            n1Color: [
                gParams?.n1Color?.c0 || { r: 255, g: 87, b: 51 },
            ],
            n2Color: [
                gParams?.n2Color?.c0 || { r: 87, g: 24, b: 69 },
            ],
            n3Color: [
                gParams?.n3Color?.c0 || { r: 199, g: 0, b: 57 },
            ],
            uBacColor: [
                gParams?.uBacColor?.c0 || { r: 0, g: 0, b: 0 },
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
                minColor: {
                    value: getRgbfromParams("minColor", 0),
                },
                maxColor: {
                    value: getRgbfromParams("maxColor", 0),
                },
                n1Color: {
                     value: getRgbfromParams("n1Color", 0),
                },
                n2Color: {
                     value: getRgbfromParams("n2Color", 0),
                },
                n3Color: {
                     value: getRgbfromParams("n3Color", 0),
                },
                uBacColor: {
                     value: getRgbfromParams("uBacColor",0),
                },
                uBlur: { value: 1.0 },
                uScale: { value: 0.1 },
                uLight: { value: 1.0 },
                uNoise: { value: 0.3 },
                uAlpha: { value: 0.5 },
            },
            fragmentShader: myFragmentShader,
            transparent: true,
        });
        let plane = new THREE.PlaneGeometry( this.canvasSize.width, this.canvasSize.height );
        this.object = new THREE.Mesh( plane, this.material );
        this.bufferScene.add( this.object );
        this.finalMaterial = new THREE.MeshBasicMaterial({map: this.textureB.texture,transparent: true,});
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
         scale: 0.1,
         light: 1.0,
         noise: 0.3,
         alpha: 0.5,
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

