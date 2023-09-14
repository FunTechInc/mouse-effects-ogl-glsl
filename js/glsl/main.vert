precision mediump float;

uniform float uTime;


void main(){
    
    //set position
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}