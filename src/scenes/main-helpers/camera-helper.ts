import { Main } from "../main-scene";


export function setupCamera(scene: Main) {
    // --- Initialize Dragging State ---
    scene.isDragging = false;
    scene.dragStartPoint = { x: 0, y: 0 };
    scene.idleTimer = null; // Will hold our timer event when drag ends

    // Start following the pig initially
    if (scene.pig) {
        scene.cameras.main.startFollow(scene.pig, true);
    }

    // --- Listen for Pointer (Mouse/Touch) Events ---

    // On pointer down: stop following and store initial pointer position
    scene.input.on('pointerdown', function (pointer: { x: number; y: number; }) {
        let cam = scene.cameras.main;

        // Check if the pointer is outside the camera's viewport boundaries.
        // (cam.x, cam.y) is the top-left corner and (cam.width, cam.height) the dimensions.
        if (pointer.x < cam.x || pointer.x > cam.x + cam.width ||
            pointer.y < cam.y || pointer.y > cam.y + cam.height) {
            // If outside, do nothing.
            return;
        }

        // Stop following so the user can pan manually
        if (scene.pig) {
            scene.cameras.main.stopFollow();
        }

        scene.isDragging = true;
        scene.dragStartPoint.x = pointer.x;
        scene.dragStartPoint.y = pointer.y;

        // Cancel any pending timer that might re-enable following the pig
        if (scene.idleTimer) {
            scene.idleTimer?.remove();
            scene.idleTimer = null;
        }
    }, scene);

    // On pointer move: pan the camera by the pointer delta
    scene.input.on('pointermove', function (pointer: { x: number; y: number; }) {
        if (!scene.isDragging) return;

        // Calculate movement delta
        const deltaX = pointer.x - scene.dragStartPoint.x;
        const deltaY = pointer.y - scene.dragStartPoint.y;

        // Adjust the camera’s scroll position. Note that subtracting the delta
        // gives the natural dragging direction (move finger right to pan left, etc.)
        scene.cameras.main.scrollX -= deltaX;
        scene.cameras.main.scrollY -= deltaY;

        // Update the starting point for the next move event
        scene.dragStartPoint.x = pointer.x;
        scene.dragStartPoint.y = pointer.y;
    }, scene);

    // On pointer up: stop dragging and start a timer to resume following
    scene.input.on('pointerup', function () {
        scene.isDragging = false;

        // After 3 seconds of inactivity, re-enable camera follow
        scene.idleTimer = scene.time.delayedCall(3000, function () {
            if (scene.pig) {
                scene.cameras.main.startFollow(scene.pig, true);
            }
        }, [], scene);
    }, scene);

    // Optionally, also handle pointer cancel events (e.g., if touch is interrupted)
    scene.input.on('pointercancel', function () {
        scene.isDragging = false;
        scene.idleTimer = scene.time.delayedCall(3000, function () {
            if (scene.pig) {
                scene.cameras.main.startFollow(scene.pig, true);
            }
        }, [], scene);
    }, scene);
}

export function resetCamera(scene: Main) {
    // Clear dragging state and reset the start point
    scene.isDragging = false;
    scene.dragStartPoint = { x: 0, y: 0 };

    // If there is an idle timer pending, remove it
    if (scene.idleTimer) {
        scene.idleTimer.remove();
        scene.idleTimer = null;
    }

    // Resume following the pig immediately (if it exists)
    if (scene.pig) {
        scene.cameras.main.startFollow(scene.pig, true);
    }
}