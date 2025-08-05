import { Workbox } from 'workbox-window';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');

  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      if (confirm('New app update is available! Click OK to refresh.')) {
        window.location.reload();
      }
    }
  });

  wb.register();
} else {
  console.log('Service Worker is not supported by this browser.');
}