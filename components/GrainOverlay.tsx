import React, { useState, useEffect } from 'react';

export const GrainOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.12]">
       <div className="absolute inset-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-60 brightness-100 contrast-150"></div>
    </div>
  );
};