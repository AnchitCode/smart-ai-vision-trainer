export type Point3D = {
  x: number;
  y: number;
  z?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the angle ABC (in degrees) at point B.
 *
 * A = first joint (proximal)
 * B = middle joint (vertex)
 * C = third joint (distal)
 */
export function calculateAngle(A: Point3D, B: Point3D, C: Point3D): number {
  const ax = A.x - B.x;
  const ay = A.y - B.y;
  const az = (A.z ?? 0) - (B.z ?? 0);

  const cx = C.x - B.x;
  const cy = C.y - B.y;
  const cz = (C.z ?? 0) - (B.z ?? 0);

  const dot = ax * cx + ay * cy + az * cz;
  const magA = Math.hypot(ax, ay, az);
  const magC = Math.hypot(cx, cy, cz);

  if (magA === 0 || magC === 0) return NaN;

  const cosTheta = clamp(dot / (magA * magC), -1, 1);
  const angleRad = Math.acos(cosTheta);
  return (angleRad * 180) / Math.PI;
}

