/**
 * Lightens a hex color by a given percentage.
 * @param hex - The base color in hex (e.g., 0xabcdef).
 * @param percent - The percentage to lighten (0.0 to 1.0).
 * @returns The lightened color in hex.
 */
export function lightenColor(hex: number, percent: number): number {
    // Extract the red, green, and blue components
    let r = (hex >> 16) & 0xff;
    let g = (hex >> 8) & 0xff;
    let b = hex & 0xff;

    // Increase each component towards 255 (white)
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    return (r << 16) | (g << 8) | b;
}

/**
 * Darkens a hex color by a given percentage.
 * @param hex - The base color in hex (e.g., 0xabcdef).
 * @param percent - The percentage to darken (0.0 to 1.0).
 * @returns The darkened color in hex.
 */
export function darkenColor(hex: number, percent: number): number {
    // Extract the red, green, and blue components
    let r = (hex >> 16) & 0xff;
    let g = (hex >> 8) & 0xff;
    let b = hex & 0xff;

    // Decrease each component towards 0 (black)
    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));

    return (r << 16) | (g << 8) | b;
}
