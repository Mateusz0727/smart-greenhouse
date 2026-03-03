import React from 'react';

// This targets the base icon type used across the entire library
declare module 'react-icons' {
    export type IconType = (props: any) => React.ReactElement;
}

// This handles the specific sub-modules like 'ci' and 'gr'
declare module 'react-icons/ci' {
    export const CiTempHigh: React.ComponentType<any>;
    export const CiTimer: React.ComponentType<any>;
}

declare module 'react-icons/gr' {
    export const GrSecure: React.ComponentType<any>;
}