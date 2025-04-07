

export function isPortrait(width: number, height: number): boolean {
    const normalizedWidth = Math.round(width / window.devicePixelRatio);
    const normalizedHeight = Math.round(height / window.devicePixelRatio);
    return normalizedWidth < normalizedHeight && normalizedWidth < 600;
}