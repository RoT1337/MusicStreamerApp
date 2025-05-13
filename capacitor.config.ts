import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MusicStreamerApp',
  webDir: 'www',
  plugins: {
    App: {
      urlSchemes: ['beam']
    }
  }
};

export default config;
