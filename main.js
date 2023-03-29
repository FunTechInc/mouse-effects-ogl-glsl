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
      }
   );
   gParticle.init();
})();
