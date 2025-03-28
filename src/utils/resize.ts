

export function isPortrait(width: number, height: number): boolean {
    return width < height && width < 600;
}