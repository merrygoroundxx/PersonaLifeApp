const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// 全局样式文件位于 app/global.css，因此这里需要匹配这个路径
module.exports = withNativeWind(config, { input: "./app/global.css" });
