precision highp float;

uniform sampler2D tMap;

uniform float u_falloff;
uniform float u_alpha;
uniform float u_dissipation;

uniform float u_aspect;
uniform vec2 u_mouse;
uniform vec2 u_velocity;
uniform float u_easing;

uniform vec2 u_resolution;

varying vec2 vUv;

float PI = 3.141592;

void main() {
    vec4 color = texture2D(tMap, vUv) * u_dissipation;

    vec2 cursor = vUv - u_mouse;
    cursor.x *= u_aspect;

    vec3 stamp = vec3(u_velocity * vec2(1.5, -1), u_easing - pow(1. - min(1., length(u_velocity)), 1.));
    float falloff = smoothstep(u_falloff, 0.0, length(cursor)) * u_alpha;

    color.rgb = mix(color.rgb, stamp, vec3(falloff));

    gl_FragColor = color;
}