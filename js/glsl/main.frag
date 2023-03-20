precision mediump float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform sampler2D bufferTexture;
uniform sampler2D newTexture;
uniform vec2 uTouch;
uniform float uTime;
uniform vec3 minColor;
uniform vec3 maxColor;
uniform float uScale;
uniform float uBlur;

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

//blur
float remap01(float a,float b,float t){
    return(t-a)/(b-a);
}
float remap(float a,float b,float c,float d,float t){
    return remap01(a,b,t)*(d-c)+c;
}

void main(){
    vec2 pixel=gl_FragCoord.xy/uResolution.xy;
    vec2 uv=vUv.xy;
    vec2 mouse = uTouch*0.5+0.5;
    mouse.x += 0.1;

    vec4 v=texture2D(bufferTexture,pixel);
    vec2 dir=normalize(mouse-pixel);

    
    float m=snoise(vec2(1.0+sin(uTime*0.2)+pixel.x,1.0+cos(uTime*0.5)+pixel.y));
    float mask=smoothstep(uScale,uScale*m*snoise(vec2(uTime*.3)),distance(pixel,mouse));

    float blur=remap(-100.,100.,.2,.3,.9);
    blur=pow(blur*3.,1.)*.4*uBlur;

    vec3 color=mix(minColor*1.0,maxColor*m*1.,distance(pixel,mouse));

    // float xPixel=1./uResolution.x;//The size of a single pixel
    // float yPixel=1./uResolution.y;
    // vec4 rightColor=texture2D(bufferTexture,vec2(pixel.x+xPixel,pixel.y));
    // vec4 leftColor=texture2D(bufferTexture,vec2(pixel.x-xPixel,pixel.y));
    // vec4 upColor=texture2D(bufferTexture,vec2(pixel.x,pixel.y+yPixel));
    // vec4 downColor=texture2D(bufferTexture,vec2(pixel.x,pixel.y-yPixel));
    //Handle the bottom boundary
    // if(pixel.y<=yPixel){
    //     downColor.rgb=vec3(0.);
    // }
    // float factor=8.*.016*(leftColor.r+rightColor.r+downColor.r*3.+upColor.r-6.*gl_FragColor.r);

    float intensity=1.-min(length(mouse*2.-1.0),1.)*0.8;

    gl_FragColor=vec4(color,1.)*blur*mask*rand(m)*intensity;
    // gl_FragColor = vec4(c.xy,0.0,1.0);

}