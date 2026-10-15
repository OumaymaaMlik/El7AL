/**
 * The El 7al "7": a collegiate numeral with a notched top bar, a slanted stem and a flat slab foot.
 * One outline used by the header logo (flat SVG) and the login animation (extruded 3D), so they are the same shape.
 * Points are on a unit grid, y pointing down, clockwise from the top-left corner.
 */
export const SEVEN_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.911, 0],
  [1, 0.187],
  [0.684, 0.813],
  // The foot sticks out as far on the right as on the left of the stem.
  [0.805, 0.813],
  [0.805, 1],
  [0.126, 1],
  [0.126, 0.813],
  [0.247, 0.813],
  [0.595, 0.187],
  [0.289, 0.187],
  [0.289, 0.287],
  [0, 0.287],
];

/** Width divided by height of the letter. */
export const SEVEN_ASPECT = 0.71;
