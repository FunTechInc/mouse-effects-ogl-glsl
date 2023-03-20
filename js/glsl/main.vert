precision mediump float;

varying vec2 vUv;


void main(){
    vec3 pos=position.xyz;
    vUv=uv;

    gl_Position= projectionMatrix * modelViewMatrix * vec4(pos*1.7,1.0);
}

