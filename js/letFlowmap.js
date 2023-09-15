import { Program, Mesh, Vec2, Triangle, RenderTarget } from 'ogl';
import postFragShader from "./glsl/post.frag";
import postVertShader from "./glsl/post.vert";
import { TEXTURE_RATIO, distortionState } from "./index"; 
import { Pane } from "tweakpane";

export class Flowmap {
    constructor(
        gl,
        {
            size = 128, 
            type, 
        } = {},
        
    ) {
        const _this = this;
        this.gl = gl;

        this.uniform = { value: null };

        this.mask = {
            read: null,
            write: null,
            swap: () => {
                let temp = _this.mask.read;
                _this.mask.read = _this.mask.write;
                _this.mask.write = temp;
                _this.uniform.value = _this.mask.read.texture;
            },
        };

        {
            createFBOs();

            this.aspect = 1;
            this.mouse = new Vec2();
            this.velocity = new Vec2();

            this.mesh = initProgram();
        }

        function createFBOs() {
            if (!type) type = gl.HALF_FLOAT || gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;
            let minFilter = (() => {
                if (gl.renderer.isWebgl2) return gl.LINEAR;
                if (gl.renderer.extensions[`OES_texture_${type === gl.FLOAT ? '' : 'half_'}float_linear`]) return gl.LINEAR;
                return gl.NEAREST;
            })();

            const options = {
                width: size,
                height: size,
                type,
                format: gl.RGBA,
                internalFormat: gl.renderer.isWebgl2 ? (type === gl.FLOAT ? gl.RGBA32F : gl.RGBA16F) : gl.RGBA,
                minFilter,
                depth: false,
            };

            _this.mask.read = new RenderTarget(gl, options);
            _this.mask.write = new RenderTarget(gl, options);
            _this.mask.swap();
        }

        function initProgram() {
            return new Mesh(gl, {
                geometry: new Triangle(gl),

                program: new Program(gl, {
                    vertex,
                    fragment,
                    uniforms: {
                        tMap: _this.uniform,
                        u_resolution: { value: new Vec2(
                            window.innerWidth,
                            window.innerHeight
                          )},
                        u_falloff: { value: distortionState.radian * 0.5 },
                        u_alpha: { value: distortionState.alpha },
                        u_dissipation: { value: distortionState.light },
                        u_mouse: { value: _this.mouse },
                        u_velocity: { value: _this.velocity },
                        u_aspect: { value: distortionState.asspect },
                        u_easing: { value: distortionState.easing }
                    },
                    depthTest: false,
                }),
            });
            
        }
    }

    update() {
        this.mesh.program.uniforms.u_aspect.value = this.aspect;

        this.gl.renderer.render({
            scene: this.mesh,
            target: this.mask.write,
            clear: false,
        });
        this.mask.swap();
    }
    /*===============================================
	GUI
	===============================================*/
    setGUI() {
    //     const pane = new Pane({
    //         container: document.getElementById("gui2"),
    //     });
    //     const flowmapRadianController = pane.addInput(distortionState, "radian", {
    //         min: 0,
    //         max: 1,
    //         step: 0.01,
    //     });
    //     const flowmapAlphaController = pane.addInput(distortionState, "alpha", {
    //         min: 0,
    //         max: 1,
    //         step: 0.01,
    //     });
    //     const flowmapLightController = pane.addInput(distortionState, "light", {
    //         min: 0,
    //         max: 1,
    //         step: 0.01,
    //     });
    //     const flowmapEasingController = pane.addInput(distortionState, "easing", {
    //         min: 0,
    //         max: 300,
    //         step: 0.1,
    //     });
        // flowmapRadianController.on("change", () => {
        //     this.mesh.program.u_falloff.value = distortionState.radian * 0.5;
        // });


    }
}

const vertex = postVertShader;
const fragment = postFragShader;