import React from 'react';
import logoImage from '/Gemini_Generated_Image_tb60vltb60vltb60.png';

export const Logo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img src={logoImage} alt="ScholarAI Logo" {...props} />
);
