import type { Stem, ShiShen } from "./types";
import { STEM_ELEMENT, STEM_POLARITY, ELEMENT_GENERATES, ELEMENT_OVERCOMES } from "./constants";

export function computeShiShen(dayMaster: Stem, target: Stem): ShiShen {
  const dmEl = STEM_ELEMENT[dayMaster];
  const tEl = STEM_ELEMENT[target];
  const samePolarity = STEM_POLARITY[dayMaster] === STEM_POLARITY[target];

  if (dmEl === tEl) return samePolarity ? "比肩" : "劫财";
  if (ELEMENT_GENERATES[dmEl] === tEl) return samePolarity ? "食神" : "伤官";
  if (ELEMENT_OVERCOMES[dmEl] === tEl) return samePolarity ? "偏财" : "正财";
  if (ELEMENT_OVERCOMES[tEl] === dmEl) return samePolarity ? "七杀" : "正官";
  if (ELEMENT_GENERATES[tEl] === dmEl) return samePolarity ? "偏印" : "正印";
  throw new Error(`Unreachable shishen: ${dayMaster} -> ${target}`);
}
