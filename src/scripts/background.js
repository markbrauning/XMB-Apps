document.addEventListener('click', (event) => {
    const startX = event.clientX;
    const startY = event.clientY;
  
    let currentX = startX;
    let currentY = startY;
  
    let previousAngle = 0; // Keep track of the previous angle to avoid overlap
  
    // Generate a circuit with more segments (50 segments)
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const segment = document.createElement('div');
        segment.className = 'segment';
  
        // Randomize the length and direction (only right angles)
        const length = Math.random() * 30 + 30; // Random length between 20 and 70
        const direction = Math.random() < 0.5 ? -90 : 90; // Turn left or right
        const angle = (previousAngle + direction + 360) % 360; // Ensure angles remain valid
  
        segment.style.left = `${currentX}px`;
        segment.style.top = `${currentY}px`;
        segment.style.transform = `rotate(${angle}deg)`;
  
        document.body.appendChild(segment);
  
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
        circle.style.left = `${endX - 3}px`; // Center the circle
        circle.style.top = `${endY - 3}px`; // Center the circle
        document.body.appendChild(circle);
  
        // Update the current position and angle for the next segment
        currentX = endX;
        currentY = endY;
        previousAngle = angle;
  
        // Remove the segment and circle after the animation ends
        setTimeout(() => {
          segment.remove();
          circle.remove();
        }, 3500); // Match the growth and fade-out duration
      }, i * 60); // Delay each segment by 30ms
    }
  });
  