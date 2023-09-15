attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

attribute vec3 next;
attribute vec3 prev;
// attribute vec2 uv;
attribute float side;

uniform vec2 uResolution;
uniform float uDPR;
uniform float uThickness;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}