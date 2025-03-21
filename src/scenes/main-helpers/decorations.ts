import { WORLD_HEIGHT } from "../../constants";
import { Main } from "../main-scene";


export default function addDecoration(scene: Main) {
    // Use a fixed seed so that the "random" positions are predictable.
    const seed = 'fixed-seed'; // Replace with a dynamic seed if needed.
    const random = new Phaser.Math.RandomDataGenerator([seed]);

    // Define some arbitrary offsets for positioning
    const floorYMin = WORLD_HEIGHT - 50; // near the bottom
    const floorYMax = WORLD_HEIGHT / 2 + 150;  // near the middle
    const ceilingYMin = 50;              // near the top
    const ceilingYMax = WORLD_HEIGHT / 2 - 250;  // near the middle

    const numberOfBloodStains = 15;
    const numberOfMeat = 4;
    const numberOfExtra1 = 4;
    const numberOfExtra2 = 4;
    const numberOfHangingMeatExtra = 4;


    const minX = 300;

    // Add blood stains (on the floor)
    for (let i = 0; i < numberOfBloodStains; i++) {
        if (i % 2 === 0) {
            const x = random.between(minX, scene.worldWidth - 50);
            const y = random.between(ceilingYMin, ceilingYMax);
            scene.add.image(x, y, 'BloodStain').setOrigin(0.5).setDepth(1);
        }
        else {
            const x = random.between(minX, scene.worldWidth - 50);
            const y = random.between(floorYMin, floorYMax);
            scene.add.image(x, y, 'BloodStain').setOrigin(0.5).setDepth(1);
        }

    }

    // Add random meat on the floor
    for (let i = 0; i < numberOfMeat; i++) {
        const x = random.between(minX, scene.worldWidth - 50);
        const y = random.between(floorYMin, floorYMax);
        scene.add.image(x, y, 'meat').setOrigin(0.5).setDepth(1);
    }

    // Add extra decorations on the ceiling:
    // Extra1: vertical sausage cords
    for (let i = 0; i < numberOfExtra1; i++) {
        const x = random.between(minX, scene.worldWidth - 50);
        scene.add.image(x, ceilingYMin, 'Extra1').setOrigin(0.5).setDepth(1);
    }

    // Extra2: horizontal sausage cords
    for (let i = 0; i < numberOfExtra2; i++) {
        const x = random.between(minX, scene.worldWidth - 50);
        scene.add.image(x, ceilingYMin, 'Extra2').setOrigin(0.5).setDepth(1);
    }

    // Hanging meat extra: meat hanging from the ceiling
    for (let i = 0; i < numberOfHangingMeatExtra; i++) {
        const x = random.between(minX, scene.worldWidth - 50);
        scene.add.image(x, ceilingYMin, 'hanging_meat_Extra').setOrigin(0.5).setDepth(1);
    }
}