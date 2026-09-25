document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("photoCarousel");
  if (!carousel) return;

  const photos = carousel.querySelectorAll(".carousel-photo");
  const dots = carousel.querySelectorAll(".dot");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const totalPhotos = photos.length;

  if (totalPhotos === 0) return;

  let currentPhotoIndex = 0;
  let autoSlideTimer = null;
  let touchStartX = 0;
  let touchEndX = 0;

  // Handle broken placeholder images dynamically with SVG visual fallbacks
  photos.forEach((photo, index) => {
    photo.addEventListener("error", () => {
      const label = encodeURIComponent(`Photo ${index + 1}`);
      photo.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%235b21b6"/><text x="50%" y="50%" fill="%23ffffff" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
    });
  });

  function updateCarousel() {
    photos.forEach((photo, index) => {
      const isActive = index === currentPhotoIndex;
      photo.classList.toggle("active", isActive);
      photo.setAttribute("aria-hidden", !isActive);
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentPhotoIndex;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function changePhoto(direction) {
    currentPhotoIndex =
      (currentPhotoIndex + direction + totalPhotos) % totalPhotos;
    updateCarousel();
  }

  function goToPhoto(index) {
    currentPhotoIndex = index;
    updateCarousel();
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      changePhoto(1);
    }, 4000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      changePhoto(-1);
      startAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      changePhoto(1);
      startAutoSlide();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const index = parseInt(e.target.getAttribute("data-index"), 10);
      if (!isNaN(index)) {
        goToPhoto(index);
        startAutoSlide();
      }
    });
  });

  // Touch / Swipe support for mobile navigation
  carousel.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 40;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        changePhoto(1);
      } else {
        changePhoto(-1);
      }
      startAutoSlide();
    }
  }

  // Hover and focus listeners for accessible auto-slide control
  carousel.addEventListener("mouseenter", stopAutoSlide);
  carousel.addEventListener("mouseleave", startAutoSlide);
  carousel.addEventListener("focusin", stopAutoSlide);
  carousel.addEventListener("focusout", startAutoSlide);

  // Scoped keydown listener on the carousel container
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      changePhoto(-1);
      startAutoSlide();
    } else if (e.key === "ArrowRight") {
      changePhoto(1);
      startAutoSlide();
    }
  });

  updateCarousel();
  startAutoSlide();
});
