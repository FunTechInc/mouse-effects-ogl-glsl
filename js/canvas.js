import * as THREE from "three";
import { Pane } from "tweakpane";
import HiddenThreeUtils from "./HiddenThreeUtils";
import myFragmentShader from "./glsl/main.frag";
import myVertexShader from "./glsl/main.vert";
import { LimitFrameRate } from "./LimitFrameRate";

/*===============================================
plane geo
===============================================*/

export default class BacsPlane extends HiddenThreeUtils {
    constructor(el, opt, gParams) {
        super(el, opt);
        this.material = false;
        //canvas size
        this.canvasSize = {
            width:this.el.clientWidth,
            height:this.el.clientHeight,
        }
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.trail = [];
        this.onPointerMove = this.onPointerMove.bind(this);
        //rAF ID
        this.limitFrameRate = new LimitFrameRate(60);
        this.rAFID = 0;
        // this.scene = new THREE.Scene();
        this.gParams = {
            minColor: [
                gParams?.minColor?.c0 || { r: 255, g: 255, b: 255 },
            ],
            maxColor: [
                gParams?.maxColor?.c0 || { r: 0, g: 0, b: 255 },
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
        this.textureA = new THREE.WebGLRenderTarget( this.canvasSize.width, this.canvasSize.height );
        this.textureB = new THREE.WebGLRenderTarget( this.canvasSize.width, this.canvasSize.height );
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                bufferTexture: { 
                    value: this.textureA 
                },
                newTexture: {
                    value: this.textureB
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
                uBlur: { value: 1.0 },
                uScale: { value: 0.1 },
            },
            fragmentShader: myFragmentShader,
            vertexShader: myVertexShader,
        });
        let plane = new THREE.PlaneGeometry( this.canvasSize.width, this.canvasSize.height );
        this.object = new THREE.Mesh( plane, this.material );
        this.bufferScene.add( this.object );
        this.finalMaterial = new THREE.MeshBasicMaterial({map: this.textureB});
        this.quad = new THREE.Mesh( plane, this.finalMaterial );
        this.scene.add(this.quad); 
    }
    /*===============================================
	initial
	===============================================*/
   init() {
      this.createMesh();
      window.addEventListener("pointermove", this.onPointerMove);
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
        this.render();
        this.update();
        this.rAFID = requestAnimationFrame(rendering);
      };
      this.rAFID = requestAnimationFrame(rendering);
    }

    update() {
      let time = this.state.time;
      let pointer = this.pointer;
      this.material.uniforms.uTime.value = time;
      this.material.uniforms.uTouch.value = pointer;

      this.renderer.render(this.bufferScene,this.camera,this.textureB,true);

      let t = this.textureA;
      this.textureA = this.textureB;
      this.textureB = t;
      this.quad.material.map = this.textureB;
      this.material.uniforms.bufferTexture.value = this.textureA;

    //   this.renderer.render( this.scene, this.camera );
   }
   /*===============================================
	GUI
	===============================================*/
   setGUI() {
      const pane = new Pane({
         container: document.getElementById("gui"),
      });
      const PARAMS = {
         minColor: {
            r: this.gParams.minColor[0].r,
            g: this.gParams.minColor[0].g,
            b: this.gParams.minColor[0].b,
         },
         maxColor: {
            r: this.gParams.maxColor[0].r,
            g: this.gParams.maxColor[0].g,
            b: this.gParams.maxColor[0].b,
         },
         blur: 1.0,
         scale: 0.1,
         pause: false,
      };
      //folder
      const minfolder = pane.addFolder({
         title: "min color",
         expanded: false,
      });
      const maxfolder = pane.addFolder({
         title: "max color",
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
      //noise color
      minfolder
         .addInput(PARAMS, "minColor", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.minColor.value = updateGuiColor(v.value);
         });
      //blend color
      maxfolder
         .addInput(PARAMS, "maxColor", { view: "color" })
         .on("change", (v) => {
            this.material.uniforms.maxColor.value = updateGuiColor(v.value);
         });
      //blur
      pane.addInput(PARAMS, "blur", { min: 1, max: 3 }).on("change", (v) => {
         this.material.uniforms.uBlur.value = v.value;
      });   
      //scale
      pane.addInput(PARAMS, "scale", { min: 0.1, max: 0.5 }).on("change", (v) => {
         this.material.uniforms.uScale.value = v.value;
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

