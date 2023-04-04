import './style.css'
import MainCanvas from './js/maincanvas';
import MainFog from './js/mainfog';

(() => {
   const target = "webgl";
   const el = document.getElementById(target);
   const gParticle = new MainCanvas(
   // const gParticle = new MainFog(   
      el,
      {
         debug: {
            axis: false,
            controls: false,
         },
         clearColor: 0xffffff,
         clearAlpha: 0.0,
         depth: true,
         antialias: true,
         alpha: true,
      },
      {
         scale: 0.15,
         light: 1.0,
         noise: 0.9,
         alpha: 1.0,
         nColors: {
            c0: {
               r: 255,
               g: 224,
               b: 43,
            },
            c1: {
               r: 249,
               g: 24,
               b: 2,
            },
            c2: {
               r: 32,
               g: 104,
               b: 163,
            },
         }
      }
   );
   gParticle.init();
})();
