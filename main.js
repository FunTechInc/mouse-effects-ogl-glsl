import './style.css'
import WebGL from './js/maincanvas';

(() => {
   const target = "webgl";
   const el = document.getElementById(target);
   const gParticle = new WebGL(
   // const gParticle = new MainFog(   
      el,
   );
   gParticle.init();
})();
