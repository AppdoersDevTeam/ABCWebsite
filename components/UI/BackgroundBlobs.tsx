import React from 'react';

export const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
      {/* Massive Cool Anchor - Top Right (Blue/Purple) */}
      <div 
        className="absolute -top-[10%] -right-[10%] w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"
      ></div>
      
      {/* Secondary Vibrant - Top Left (Teal) */}
      <div 
        className="absolute top-[0%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-teal-300/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob-reverse"
        style={{ animationDelay: '2s' }}
      ></div>
      
      {/* Deep Tone - Bottom Left (Indigo) */}
      <div 
        className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob"
        style={{ animationDelay: '4s' }}
      ></div>
      
      {/* Bright Pop - Bottom Right (Pink/Rose) */}
      <div 
        className="absolute bottom-[0%] -right-[5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[90px] opacity-60 animate-blob-reverse"
        style={{ animationDelay: '6s' }}
      ></div>
      
      {/* Center Connectors (Soft Sky Blue) */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-sky-200/50 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-pulse-slow"
      ></div>

      {/* Scattered Detail Blobs for Texture */}
      <div 
        className="absolute top-[20%] right-[30%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[60px] opacity-40 animate-blob"
        style={{ animationDelay: '1s' }}
      ></div>
      
       <div 
        className="absolute bottom-[40%] left-[20%] w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] bg-cyan-300/30 rounded-full mix-blend-multiply filter blur-[50px] opacity-40 animate-blob-reverse"
        style={{ animationDelay: '3s' }}
      ></div>

      <div 
        className="absolute top-[10%] left-[40%] w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] bg-fuchsia-300/30 rounded-full mix-blend-multiply filter blur-[40px] opacity-30 animate-blob"
        style={{ animationDelay: '5s' }}
      ></div>
    </div>
  );
};