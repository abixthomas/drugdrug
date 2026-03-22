// types/smiles-drawer.d.ts
declare module "smiles-drawer" {
  export class SmilesDrawer {
    constructor(options?: Record<string, unknown>);
    draw(
      tree: unknown,
      canvas: HTMLCanvasElement | string,
      theme?: string,
      weights?: unknown
    ): void;
  }
  export function parse(
    smiles: string,
    success: (tree: unknown) => void,
    error?: (err: unknown) => void
  ): void;
}
