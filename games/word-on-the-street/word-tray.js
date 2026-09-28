export function insertionIndex(rects, x, y) {
  for (let index = 0; index < rects.length; index += 1) {
    const rect = rects[index];
    const midY = (rect.top + rect.bottom) / 2;
    const midX = (rect.left + rect.right) / 2;
    if (y < rect.top || (y <= rect.bottom && x < midX)) return index;
    if (y < midY && index + 1 < rects.length && rects[index + 1].top > rect.top) return index + 1;
  }
  return rects.length;
}
