import { Renderer, Program, Texture, Mesh, Vec2, Triangle, Color, TextureLoader } from 'ogl';
import { Pane } from "tweakpane";
import oglFragmentShader from "./glsl/main.frag";
import oglVertexShader from "./glsl/main.vert";
import { TEXTURE_RATIO, distortionState } from "./index"; 
import { Flowmap } from './letFlowmap';

export default class FlowmapRenderer {
    constructor(el, opt) {
        this.el = el;
        this.canvasSize = {
            width: this.el.clientWidth,
            height: this.el.clientHeight,
        };
    }
    init() {
        this.renderer = new Renderer({ dpr: 1 });
        this.gl = this.renderer.gl;
        document.body.appendChild(this.gl.canvas);

        this.aspect = 1;
        this.mouse = new Vec2(-1);
        this.velocity = new Vec2();

        this.setupResize();
        this.setupFlowmap();
        this.setupTexture();
        this.setupProgram();
        this.setupMouseHandlers();
        this.render();
        this.rAFID = 0;

        this.setGUI();
        this.play();
    }

    setupResize() {
        const resize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.aspect = window.innerWidth / window.innerHeight;
        };

        window.addEventListener('resize', resize, false);
        resize();
    }

    setupFlowmap() {
        this.flowmap = new Flowmap(this.gl);
    }

    setupTexture() {
        this.textureLoader = new TextureLoader();
        this.textureLoader.onload = () => {
            this.noiseTexture = this.textureLoader.load(this.gl, { src: "./textures/noiseTexture.jpg", });
            // this.bgTexture0 = this.textureLoader.load(this.gl, { src: "./textures/sample.jpg", });
            // this.bgTexture1 = this.textureLoader.load(this.gl, { src: "./textures/sample2.jpg", });
        }
        this.texture = new Texture(this.gl, {
            width: this.canvasSize.width,
            height: this.canvasSize.height
        });
        // this.texture2 = new Texture(this.gl, {
        //     width: this.canvasSize.width,
        //     height: this.canvasSize.height
        // });
        // this.texture3 = new Texture(this.gl, {
        //     width: this.canvasSize.width,
        //     height: this.canvasSize.height
        // });
        const img = new Image();
        const img2 = new Image();
        const img3 = new Image();
        img.onload = () => {
            this.texture.image = img;
        };
        // img2.onload = () => {
        //     this.texture2.image = img2;
        // };
        // img3.onload = () => {
        //     this.texture3.image3 = img3;
        // };
        img.src = './textures/hokusai.jpeg';
        // img2.src = './textures/sample.jpg';
        // img3.src = './textures/sample2.jpg';
    }

    setupProgram() {
        this.program = new Program(this.gl, {
            vertex: oglVertexShader,
            fragment: oglFragmentShader,
            uniforms: {
                tWater: { value: this.texture },
                tFlow: this.flowmap.uniform,
                u_resolution: {
                    value: new Vec2(
                      this.canvasSize.width,
                      this.canvasSize.height
                    ),
                },
                u_imageResolution: {
                    value: new Vec2(TEXTURE_RATIO.x, TEXTURE_RATIO.y),
                },
                u_noiseTexture: { value: this.noiseTexture },
                u_bgTexture0: { value: this.texture2 },
                u_bgTexture1: { value: this.texture3 },
                u_noiseStrength: { value: distortionState.noiseStrength },
                u_noiseTime: { value: distortionState.noiseTime },
                u_waveStrength: { value: distortionState.waveStrength },
                u_progress: { value: distortionState.progress },
                u_progress2: { value: distortionState.progress2 },
                u_time: { value: 0 },
                u_pointer: { value: this.mouse },
                u_color1: { value: new Color(distortionState.color1) },
                u_color2: { value: new Color(distortionState.color2) },
                u_flowmapRadius: { value: distortionState.flowmapRadius },
                u_flowmapSpeed: { value: distortionState.flowmapSpeed },
                u_flowmapStrength: { value: distortionState.flowmapStrength },
                u_glassStrength: { value: distortionState.glassStrength },
                u_glassTime: { value: distortionState.glassTime },

            },
        });
        console.log(this.program.uniforms.u_color2);
        this.geometry = new Triangle(this.gl);
        this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    }

    setupMouseHandlers() {
        const isTouchCapable = 'ontouchstart' in window;
        if (isTouchCapable) {
            window.addEventListener('touchstart', this.updateMouse.bind(this), false);
            window.addEventListener('touchmove', this.updateMouse.bind(this), false);
        } else {
            window.addEventListener('mousemove', this.updateMouse.bind(this), false);
        }

        this.lastTime = null;
        this.lastMouse = new Vec2();
    }

    updateMouse(e) {
        if (e.changedTouches && e.changedTouches.length) {
            e.x = e.changedTouches[0].pageX;
            e.y = e.changedTouches[0].pageY;
        }
        if (e.x === undefined) {
            e.x = e.pageX;
            e.y = e.pageY;
        }

        this.mouse.set(e.x / this.gl.renderer.width, 1.0 - e.y / this.gl.renderer.height);

        if (!this.lastTime) {
            this.lastTime = performance.now();
            this.lastMouse.set(e.x, e.y);
        }

        const deltaX = e.x - this.lastMouse.x;
        const deltaY = e.y - this.lastMouse.y;

        this.lastMouse.set(e.x, e.y);

        const time = performance.now();
        const delta = Math.max(14, time - this.lastTime);
        this.lastTime = time;

        this.velocity.x = deltaX / delta;
        this.velocity.y = deltaY / delta;

        this.velocity.needsUpdate = true;
    }
    pause() {
        cancelAnimationFrame(this.rAFID);
    }
    play() {
        const rendering = () => {
          this.render(this.rAFID);
          this.rAFID = requestAnimationFrame(rendering);
        };
        this.rAFID = requestAnimationFrame(rendering);
      }

    render(t) {
        if (!this.velocity.needsUpdate) {
            this.mouse.set(-1);
            this.velocity.set(0);
        }
        this.velocity.needsUpdate = false;

        this.flowmap.aspect = this.aspect;
        this.flowmap.mouse.copy(this.mouse);

        this.flowmap.velocity.lerp(this.velocity, this.velocity.len() ? 0.5 : 0.1);
        this.flowmap.update();

        this.program.uniforms.u_time.value = t * 0.01;

        this.renderer.render({ scene: this.mesh });
    }
    /*===============================================
	GUI
	===============================================*/
    setGUI() {
        const pane = new Pane({
        container: document.getElementById("gui"),
        });
        // Add numeric sliders
        const noiseStrengthController = pane.addInput(
        distortionState,
        "noiseStrength",
        {
            min: 0,
            max: 1,
            step: 0.01,
        }
        );
        const noiseTimeController = pane.addInput(distortionState, "noiseTime", {
        min: 0,
        max: 0.1,
        step: 0.001,
        });
        const waveStrengthController = pane.addInput(
        distortionState,
        "waveStrength",
        {
            min: 0,
            max: 0.03,
            step: 0.0001,
        }
        );
        const flowmapRadiusController = pane.addInput(
        distortionState,
        "flowmapRadius",
        {
            min: 0,
            max: 1,
            step: 0.01,
        }
        );
        const flowmapSpeedController = pane.addInput(
        distortionState,
        "flowmapSpeed",
        {
            min: 0,
            max: 1,
            step: 0.01,
        }
        );
        const flowmapStrengthController = pane.addInput(
        distortionState,
        "flowmapStrength",
        {
            min: 0,
            max: 1,
            step: 0.01,
        }
        );
        const glassStrengthController = pane.addInput(
        distortionState,
        "glassStrength",
        {
            min: 0,
            max: 1,
            step: 0.01,
        }
        );
        const glassTimeController = pane.addInput(distortionState, "glassTime", {
            min: 0,
            max: 3,
            step: 0.01,
        });
        
        noiseTimeController.on("change", () => {
        this.program.uniforms.u_noiseTime.value = distortionState.noiseTime;
        });
        noiseStrengthController.on("change", () => {
        this.program.uniforms.u_noiseStrength.value =
            distortionState.noiseStrength;
        });
        waveStrengthController.on("change", () => {
        this.program.uniforms.u_waveStrength.value =
            distortionState.waveStrength;
        });
        flowmapRadiusController.on("change", () => {
        this.program.uniforms.u_flowmapRadius.value =
            distortionState.flowmapRadius;
        });
        flowmapSpeedController.on("change", () => {
        this.program.uniforms.u_flowmapSpeed.value =
            distortionState.flowmapSpeed;
        });
        flowmapStrengthController.on("change", () => {
        this.program.uniforms.u_flowmapStrength.value =
            distortionState.flowmapStrength;
        });
        glassStrengthController.on("change", () => {
        this.program.uniforms.u_glassStrength.value = distortionState.glassStrength;
        });
        glassTimeController.on("change", () => {
        this.program.uniforms.u_glassTime.value = distortionState.glassTime;
        });

        // Add color inputs
        const color1Controller = pane.addInput(distortionState, "color1");
        color1Controller.on("change", () => {
        this.program.uniforms.u_color1.value.set(distortionState.color1);
        });
        const color2Controller = pane.addInput(distortionState, "color2");
        color2Controller.on("change", () => {
        this.program.uniforms.u_color2.value.set(distortionState.color2);
        });
        // Add a pause checkbox
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
