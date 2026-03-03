import 'react-konva';
import React from 'react';
declare module 'react-icons/ci';
declare module 'react-icons/gr';
declare module 'react-icons/hi'; // Add any others you use
declare module 'react-icons/bi';
declare module 'react-konva' {
  export interface StageProps {
    children?: React.ReactNode;
  }
  export interface LayerProps {
    children?: React.ReactNode;
  }
  export interface GroupProps {
    children?: React.ReactNode;
  }
}