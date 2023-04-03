precision mediump float;


float rand(float n){
    return fract(sin(n)*43758.5453123);
}
vec3 mod289(vec3 x){
    return x-floor(x*(1./289.))*289.;
}
vec2 mod289(vec2 x){
    return x-floor(x*(1./289.))*289.;
}
vec3 permute(vec3 x){
    return mod289(((x*34.)+10.)*x);
}
float snoise(vec2 v)
{
    const vec4 C=vec4(.211324865405187,// (3.0-sqrt(3.0))/6.0
    .366025403784439,// 0.5*(sqrt(3.0)-1.0)
    -.577350269189626,// -1.0 + 2.0 * C.x
    .024390243902439);// 1.0 / 41.0
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1;
    i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;
    i=mod289(i);// Avoid truncation effects in permutation
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))
    +i.x+vec3(0.,i1.x,1.));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m;
    m=m*m;
    vec3 x=2.*fract(p*C.www)-1.;
    vec3 h=abs(x)-.5;
    vec3 ox=floor(x+.5);
    vec3 a0=x-ox;
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
}

float fbm(vec2 n){
float total=0.,amplitude=1.;
for(int i=0;i<4;i++){
    total+=snoise(n)*amplitude;
    n+=n;
    amplitude*=.5;
}
return total;
}

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 n1Color;
uniform vec3 n2Color;
uniform vec3 n3Color;
uniform float uLight;
uniform float uNoise;
uniform float uAlpha;

void main(){

vec2 pixel=gl_FragCoord.xy/uResolution.xy;
float m=snoise(vec2(1.+sin(uTime*.3)+pixel.x,1.+cos(uTime*.5)+pixel.y));

float n1=fbm(pixel+(uTime*.1))+fbm(pixel-uTime*.1);
float n2=fbm(pixel-cos(uTime*.1));
float n3=fbm(pixel+cos(uTime*.1));
vec3 col=n1Color*n1+n2Color*n2+n3Color*n3;

gl_FragColor.rgb=(col)*uLight*clamp(clamp(rand(m),0.1,0.9),1.-uNoise,1.0);
gl_FragColor.a=float(col)*uLight*clamp(clamp(rand(m),.1,.9),1.-uNoise,1.)*uAlpha;

}