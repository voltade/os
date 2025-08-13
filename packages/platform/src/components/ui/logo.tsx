import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@voltade/ui/theme-provider.js';
import { useEffect, useState } from 'react';

export function Logo() {
  const navigate = useNavigate();
  const { theme } = useTheme(); // app theme
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => setSystemTheme(media.matches ? 'dark' : 'light');

    updateTheme();
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, []);

  const effectiveTheme = theme === 'system' ? systemTheme : theme; // handle case where app theme follows system

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: Clickable logo navigates home; keyboard handling intentionally omitted. */
    <svg
      className="h-6 w-auto shrink-0 cursor-pointer "
      width="347"
      height="110"
      viewBox="0 0 347 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => {
        navigate({ to: '/' });
      }}
    >
      <title>Voltade</title>
      <path
        d="M61.7 29.2H72l17.6 40.4 17.7-40.4h10L90.2 88h-1.3L61.7 29.2ZM134 88.8c-3.8 0-7.1-.9-10-2.6-3-1.7-5.3-4-6.9-7a20 20 0 0 1-2.4-9.7c0-3.5.8-6.7 2.3-9.7 1.6-2.9 4-5.2 6.8-7 3-1.6 6.4-2.5 10.2-2.5 3.8 0 7.2.9 10 2.6 3 1.7 5.3 4 6.8 7 1.6 2.9 2.4 6.1 2.4 9.6a20 20 0 0 1-2.4 9.8c-1.6 3-3.9 5.2-6.8 7a19.2 19.2 0 0 1-10 2.5Zm.2-7c3.1 0 5.6-1.2 7.3-3.5 1.8-2.3 2.7-5.2 2.7-8.6 0-3.5-1-6.4-2.8-8.7a9.3 9.3 0 0 0-7.6-3.6 9 9 0 0 0-7.4 3.5 14 14 0 0 0-2.7 8.8c0 3.4 1 6.3 3 8.6s4.5 3.5 7.5 3.5Zm29-52.6h8.5V88h-8.5V29.2ZM187 58.3h-6.4v-7h6.4v-15l8.8-1.9v16.9h8.4v7h-8.4V88H187V58.3Zm40.5 30.5c-3.3 0-6.4-.8-9.2-2.3a18.5 18.5 0 0 1-9.2-17c0-3.8.7-7.2 2.2-10 1.5-3 3.6-5.2 6.3-6.8a18.6 18.6 0 0 1 15.6-1.3c1.8.8 3.4 1.7 4.7 2.8 1.3 1.1 2.1 2.2 2.6 3.2l.1-6.1h8.3V88h-8.2l-.2-6.5c-.9 2-2.5 3.6-5 5.1-2.3 1.5-5 2.2-8 2.2Zm1.4-7.2c3 0 5.6-1 7.7-3.1 2.1-2.2 3.1-5 3.1-8.3v-.6a13 13 0 0 0-1.4-6.2c-1-1.8-2.3-3.2-4-4.2-1.6-1-3.4-1.5-5.4-1.5-3.4 0-6 1.1-7.9 3.3-1.8 2.2-2.8 5-2.8 8.6 0 3.6 1 6.5 2.7 8.7a10 10 0 0 0 8 3.3Zm47.8 7.2c-3.3 0-6.4-.8-9.2-2.3a18.5 18.5 0 0 1-9.2-17c0-5.8 1.6-10.4 4.9-13.9 3.3-3.5 7.7-5.3 13.2-5.3 3 0 6 .8 8.5 2.3 2.5 1.5 4.3 3.3 5.2 5.5l-.4-6.3V29.2h8.5V88h-8.3l-.1-6.5c-1 2-2.6 3.6-5 5.1-2.4 1.5-5.1 2.2-8 2.2Zm1.5-7.3c3 0 5.6-1 7.6-3.1 2.1-2.1 3.2-5 3.2-8.3v-.6a13 13 0 0 0-1.5-6.1 10.2 10.2 0 0 0-9.4-5.8c-3.4 0-6 1.1-7.9 3.4-1.8 2.1-2.8 5-2.8 8.5 0 3.6 1 6.5 2.8 8.7a10 10 0 0 0 8 3.3Zm48.8 7.3c-4.4 0-8-.9-11-2.6-3-1.7-5-4-6.5-7-1.3-2.9-2-6-2-9.5 0-4 .8-7.3 2.4-10.3 1.6-2.9 3.9-5.1 6.8-6.7 2.8-1.6 6-2.4 9.7-2.4 5.7 0 9.9 1.6 12.6 4.7a19 19 0 0 1 4.1 13.2c0 1.4 0 2.9-.2 4.4h-26.4c.6 3.3 1.7 5.6 3.4 7 1.8 1.5 4.2 2.2 7.3 2.2a20.3 20.3 0 0 0 10.9-2.4l2.6 6.2c-1.3.9-3.1 1.6-5.4 2.2-2.3.7-5 1-8.3 1Zm7.7-22.2c0-3.3-.6-5.6-2.1-7-1.5-1.3-3.6-2-6.4-2-5.6 0-8.8 3-9.7 9h18.2Z"
        fill={effectiveTheme === 'dark' ? '#fff' : '#454545'}
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="m.4 55.9 11.3-15.5L7 59H2A2 2 0 0 1 .4 56ZM11.2 59 18 31.7 37.6 4.8c1.3-1.7 4-.5 3.5 1.7l-8.3 34.7a2 2 0 0 0 2 2.5h11.5L39.5 71l-19 26c-1.4 1.7-4.2.4-3.6-1.8l9.3-33.7a2 2 0 0 0-1.9-2.6h-13Zm34.6 3.6 11.6-15.8a2 2 0 0 0-1.6-3.1h-5.3l-4.7 19Z"
        fill="url(#paint0_linear_128_163)"
        fill-opacity=".9"
      />
      <defs>
        <linearGradient
          id="paint0_linear_128_163"
          x1="61.7"
          y1=".4"
          x2="28.9"
          y2="105.8"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".4" stop-color="#8E24AA" />
          <stop offset="1" stop-color="#039BE5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
