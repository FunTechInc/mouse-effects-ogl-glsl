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
    const vec4 C=vec4(.211324865405187,
        .366025403784439,
        -.577350269189626,
    .024390243902439);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1;
    i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;
    i=mod289(i);
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
// float remap01(float a,float b,float t){
    //     return(t-a)/(b-a);
// }
// float remap(float a,float b,float c,float d,float t){
    //     return remap01(a,b,t)*(d-c)+c;
// }

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
uniform sampler2D bufferTexture;
uniform vec2 uTouch;
uniform float uTime;
uniform vec3 n1Color;
uniform vec3 n2Color;
uniform vec3 n3Color;
uniform float uScale;
uniform float uLight;
uniform float uNoise;
uniform float uAlpha;
// uniform float uBlur;

void main(){
    
    vec2 pixel=gl_FragCoord.xy/uResolution.xy;
    vec2 mouse=((uTouch+1.)/2.);
    float dist=distance(mouse.xy,pixel.xy);
    
    float n1=fbm(pixel+(uTime*.3))+fbm(pixel-uTime*.3);
    float n2=fbm(pixel-cos(uTime*.3));
    float n3=fbm(pixel+cos(uTime*.3));
    vec3 col=(n1Color*n1+n2Color*n2+n3Color*n3);
    
    float m=snoise(vec2(1.+sin(uTime*.3)+pixel.x,1.+cos(uTime*.5)+pixel.y));
    float mask=smoothstep(uScale*1.9,uScale*.9,dist);
    
    // float blur=remap(-100.,100.,.2,.3,.9);
    // blur=pow(blur*3.,1.)*.4*uBlur*1.;
    
    float xPixel=1./uResolution.x;
    float yPixel=1./uResolution.y;
    vec4 rightColor=texture2D(bufferTexture,vec2(pixel.x+xPixel,pixel.y));
    vec4 leftColor=texture2D(bufferTexture,vec2(pixel.x-xPixel,pixel.y));
    vec4 upColor=texture2D(bufferTexture,vec2(pixel.x,pixel.y+yPixel));
    vec4 downColor=texture2D(bufferTexture,vec2(pixel.x,pixel.y-yPixel));
    
    float factor=7.*.016*((leftColor.r+rightColor.r+downColor.r+upColor.r)*2.-9.*gl_FragColor.r);
    float intensity=1.-min(length(mouse*2.-1.),1.)*.8;

    
    gl_FragColor.rgb=(col*mask*clamp(clamp(rand(m),.1,1.9),1.-uNoise,1.)+vec3(factor*col))*uLight;
    gl_FragColor.a=(float(col)*mask*clamp(clamp(rand(m),.1,1.9),1.-uNoise,1.)+factor*float(col))*uLight*uAlpha;
}