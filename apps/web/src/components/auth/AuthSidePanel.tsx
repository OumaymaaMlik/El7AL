import React from 'react';
import { Stage3D } from '../ui/Stage3D';

/**
 * The green panel beside the login and register forms: the turning 3D logo, a title and a sentence.
 * One component so both pages show it at exactly the same size and place (and it follows the page while
 * the longer register form scrolls).
 */
export const AuthSidePanel: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <aside className="panel hidden lg:flex flex-col justify-between gap-8 my-6 p-8 xl:p-12 sticky top-24 self-start h-[calc(100vh-120px)] min-h-[560px]">
    <Stage3D variant="logo" label="Le logo El 7al tourne sur lui-même." className="flex-1 min-h-[300px] -mx-2 -mt-2" />
    <div>
      <h2 className="text-[clamp(32px,3.6vw,48px)] font-bold leading-[1.05] tracking-[-0.02em] rtl:tracking-normal rtl:leading-[1.25] text-white">
        {title}
      </h2>
      <p className="mt-4 max-w-[40ch] text-[17px] text-white/90">{text}</p>
    </div>
  </aside>
);
