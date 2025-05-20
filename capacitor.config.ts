import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tan.beam',
  appName: 'BeaM',
  webDir: 'www',
  plugins: {
    App: {
      urlSchemes: ['beam']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f2027",
      showSpinner: true,
      androidSpinnerStyle: "small",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
