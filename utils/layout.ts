import { Dimensions, PixelRatio } from "react-native";

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export function getScreen() {
  const { width, height } = Dimensions.get("window");
  return { width, height };
}

export function scaleSize(size: number) {
  const { width } = getScreen();
  return Math.round((width / guidelineBaseWidth) * size);
}

export function scaleFont(size: number, min = 12, max = 28) {
  const { width } = getScreen();
  const scaled = (width / guidelineBaseWidth) * size;
  const rounded = Math.round(PixelRatio.roundToNearestPixel(scaled));
  return Math.max(min, Math.min(max, rounded));
}

export function heightPercent(percent: number) {
  const { height } = getScreen();
  return Math.round((height * percent) / 100);
}

export function widthPercent(percent: number) {
  const { width } = getScreen();
  return Math.round((width * percent) / 100);
}

export function responsiveChartSize() {
  const { width } = getScreen();
  const base = Math.min(widthPercent(85), 480);
  return Math.max(base, 240);
}

