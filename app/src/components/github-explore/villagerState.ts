export interface VillagerState {
  x: number
  z: number
  targetX: number
  targetZ: number
  dirX: number
  dirZ: number
}

export function createVillagerState(x: number, z: number): VillagerState {
  return { x, z, targetX: x, targetZ: z, dirX: 0, dirZ: -1 }
}
