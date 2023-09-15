import './style.css'
import FlowmapRenderer from './js/canvas';

(() => {
   const target = "webgl";
   const el = document.getElementById(target);
   const gParticle = new FlowmapRenderer(  
      el,
   );
   gParticle.init();
})();
