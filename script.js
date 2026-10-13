document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("photoCarousel");
  if (carousel) {
    const photos = carousel.querySelectorAll(".carousel-photo");
    const dots = carousel.querySelectorAll(".dot");
    const dotsContainer = document.getElementById("carouselDots");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pausePlayBtn = document.getElementById("pausePlayBtn");
    const totalPhotos = photos.length;

    if (totalPhotos > 0) {
      let currentPhotoIndex = 0;
      let autoSlideTimer = null;
      let isPausedManually = false;
      let touchStartX = 0;
      let touchEndX = 0;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Handle broken placeholder images dynamically with SVG visual fallbacks
      function applyFallbackImage(photo, index) {
        const label = encodeURIComponent(`Photo ${index + 1}`);
        photo.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%235b21b6"/><text x="50%" y="50%" fill="%23ffffff" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
      }

      photos.forEach((photo, index) => {
        photo.addEventListener("error", () => applyFallbackImage(photo, index));
        // Fallback for already failed or cached broken images
        if (photo.complete && photo.naturalWidth === 0) {
          applyFallbackImage(photo, index);
        }
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
          dot.setAttribute("tabindex", isActive ? "0" : "-1");
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
        if (isPausedManually || prefersReducedMotion) return;
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

      function updatePausePlayBtn() {
        if (!pausePlayBtn) return;
        const isPaused = isPausedManually || autoSlideTimer === null;
        pausePlayBtn.setAttribute(
          "aria-label",
          isPaused ? "Play slideshow" : "Pause slideshow"
        );
        pausePlayBtn.setAttribute(
          "title",
          isPaused ? "Play slideshow" : "Pause slideshow"
        );
        pausePlayBtn.textContent = isPaused ? "▶" : "⏸";
      }

      if (pausePlayBtn) {
        pausePlayBtn.addEventListener("click", () => {
          isPausedManually = !isPausedManually;
          if (isPausedManually) {
            stopAutoSlide();
          } else {
            startAutoSlide();
          }
          updatePausePlayBtn();
        });
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
          const index = parseInt(e.currentTarget.getAttribute("data-index"), 10);
          if (!isNaN(index)) {
            goToPhoto(index);
            startAutoSlide();
          }
        });
      });

      // Accessible arrow key navigation for dots tablist
      if (dotsContainer) {
        dotsContainer.addEventListener("keydown", (e) => {
          let newIndex = currentPhotoIndex;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            newIndex = (currentPhotoIndex + 1) % totalPhotos;
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            newIndex = (currentPhotoIndex - 1 + totalPhotos) % totalPhotos;
          } else if (e.key === "Home") {
            e.preventDefault();
            newIndex = 0;
          } else if (e.key === "End") {
            e.preventDefault();
            newIndex = totalPhotos - 1;
          } else {
            return;
          }
          goToPhoto(newIndex);
          if (dots[newIndex]) {
            dots[newIndex].focus();
          }
          startAutoSlide();
        });
      }

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
      carousel.addEventListener("mouseleave", () => {
        if (!isPausedManually) startAutoSlide();
      });
      carousel.addEventListener("focusin", stopAutoSlide);
      carousel.addEventListener("focusout", () => {
        if (!isPausedManually) startAutoSlide();
      });

      // Stop auto-slide when page/tab is hidden to save battery and performance
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAutoSlide();
        } else if (!isPausedManually) {
          startAutoSlide();
        }
      });

      // Scoped keydown listener on the carousel container
      carousel.addEventListener("keydown", (e) => {
        if (e.target.closest("#carouselDots")) return;
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
      updatePausePlayBtn();
    }
  }

  // Scrollspy navigation link highlighting
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section[id]");

  function highlightNavOnScroll() {
    const scrollPosition = window.scrollY + 150;
    const isBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 50;

    if (isBottom && sections.length > 0) {
      const lastSectionId = sections[sections.length - 1].getAttribute("id");
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${lastSectionId}`;
        link.classList.toggle("active", isCurrent);
      });
      return;
    }

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightNavOnScroll);
  highlightNavOnScroll();

  // Dynamic current year in footer
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Back to top button
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
