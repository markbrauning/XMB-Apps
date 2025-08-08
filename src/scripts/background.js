const main = document.querySelector('main');

if (main) {
  main.addEventListener('click', (event) => {
    const rect = main.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    let currentX = startX;
    let currentY = startY;

    let previousAngle = 0; // Keep track of the previous angle to avoid overlap

    // Generate a circuit with more segments (30 segments)
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const segment = document.createElement('div');
        segment.className = 'segment';

        // Randomize the direction (only right angles)
        const direction = Math.random() < 0.5 ? -90 : 90; // Turn left or right
        const angle = (previousAngle + direction + 360) % 360; // Ensure angles remain valid

        // Determine the maximum length that keeps the segment within the main bounds
        let maxLength;
        if (angle === 0) {
          maxLength = rect.width - currentX;
        } else if (angle === 90) {
          maxLength = rect.height - currentY;
        } else if (angle === 180) {
          maxLength = currentX;
        } else {
          maxLength = currentY; // 270
        }

        if (maxLength <= 0) return;

        const length = Math.min(Math.random() * 30 + 30, maxLength);

        segment.style.left = `${currentX}px`;
        segment.style.top = `${currentY}px`;
        segment.style.transform = `rotate(${angle}deg)`;

        main.appendChild(segment);

        // Trigger the growth animation after adding the element to the DOM
        setTimeout(() => {
          segment.style.width = `${length}px`;
        }, 0);

        // Calculate the endpoint of the segment
        let endX = currentX;
        let endY = currentY;
        if (angle === 0) endX += length; // Right
        else if (angle === 90) endY += length; // Down
        else if (angle === 180) endX -= length; // Left
        else if (angle === 270) endY -= length; // Up

        // Add a circle at the end of the segment
        const circle = document.createElement('div');
        circle.className = 'circle';
        circle.style.left = `${Math.min(Math.max(endX - 3, 0), rect.width - 6)}px`; // Keep within main bounds
        circle.style.top = `${Math.min(Math.max(endY - 3, 0), rect.height - 6)}px`; // Keep within main bounds
        main.appendChild(circle);

        // Update the current position and angle for the next segment
        currentX = endX;
        currentY = endY;
        previousAngle = angle;

        // Remove the segment and circle after the animation ends
        setTimeout(() => {
          segment.remove();
          circle.remove();
        }, 3500); // Match the growth and fade-out duration
      }, i * 60); // Delay each segment by 60ms
    }
  });
}