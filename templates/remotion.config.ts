import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable("C:/Program Files/Google/Chrome/Application/chrome.exe");

export const config: Config = {
  // 默认渲染配置
  setDefaults: {
    concurrency: 4,
    quality: 100,
  },
};

export default config;
