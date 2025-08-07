function enlargeImage(img) {
    const enlargedImageContainer = document.getElementById('enlargedImageContainer');
    const enlargedImage = document.getElementById('enlargedImage');
    enlargedImage.src = img.src;
    enlargedImageContainer.style.display = 'flex';
}

function closeEnlargedImage() {
    const enlargedImageContainer = document.getElementById('enlargedImageContainer');
    enlargedImageContainer.style.display = 'none';
}
