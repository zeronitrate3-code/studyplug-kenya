import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ke.studyplug.app',
  appName: 'StudyPlug Kenya',
  webDir: 'dist',
  // Remove `server.url` so the app uses the local bundled web assets (production build).
  // During development you can temporarily add a `server: { url: 'http://<dev-ip>:5173', cleartext: true }` entry.
  android: {
    // Allow mixed content to improve compatibility with some endpoints (use carefully).
    allowMixedContent: true
  }
};

export default config;
