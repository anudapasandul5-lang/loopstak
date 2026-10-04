/** Tiny bridge so HTML rows can drive the 3D gallery without prop-drilling through the canvas. */
let hovered = -1;
export const setWorkHover = (i: number) => {
  hovered = i;
};
export const getWorkHover = () => hovered;
