import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SarkariPulse',
    short_name: 'SarkariPulse',
    description: 'Latest Sarkari Naukri, Result, Admit Card Updates',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '1024x1024',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpg',
        sizes: '1024x1024',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpg',
        sizes: '1024x1024',
        type: 'image/jpeg',
      },
    ],
  };
}
