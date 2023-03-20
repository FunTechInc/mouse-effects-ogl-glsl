import './style.css'
import javascriptLogo from './javascript.svg'
import { setupCounter } from './counter.js'
import GradationParticles from './js/canvas';

(() => {
   const target = "webgl";
   const el = document.getElementById(target);
   const gParticle = new GradationParticles(
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
