// 背景テクスチャーのアスペクト比（2の累乗）
export const TEXTURE_RATIO = {
  // x: 800,
  // y: 537,
  x: 512,
  y: 512,
};

// frameで呼び出す、コンポーネントレベルの状態管理
export const distortionState = {
   // GUI あり 
   noiseStrength: 0.,
   noiseTime: 0.,
   waveStrength: 0.0,
   progress: 0,
   progress2: 0,
   color1: '#f9f6ef',
   color2: '#efeae2',
   flowmapRadius: 0.,
   flowmapSpeed: 0.,
   flowmapStrength: 0.,
   glassStrength: 0.,
   glassTime: 0.,

   // GUI なし
   radian: 0.2, 
   alpha: 1.5, 
   light: .98, 
   asspect: 1.0,
   easing: 10.0
};
