// Mobile Menu Toggle
document
  .querySelector(".mobile-menu-btn")
  .addEventListener("click", function () {
    document.getElementById("nav-menu").classList.toggle("show");
  });

// Sticky Header on Scroll
window.addEventListener("scroll", function () {
  const header = document.getElementById("main-header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Close menu when clicking outside
document.addEventListener("click", function (event) {
  const isClickInsideMenu = event.target.closest("#nav-menu");
  const isClickOnMenuBtn = event.target.closest(".mobile-menu-btn");
  const menu = document.getElementById("nav-menu");

  if (
    menu.classList.contains("show") &&
    !isClickInsideMenu &&
    !isClickOnMenuBtn
  ) {
    menu.classList.remove("show");
  }
});

// Handle window resize
window.addEventListener("resize", function () {
  if (window.innerWidth > 768) {
    document.getElementById("nav-menu").classList.remove("show");
  }
});

// Adjust hero image on mobile devices
function adjustHeroForMobile() {
  const hero = document.querySelector(".hero");
  if (window.innerWidth <= 768) {
    // Set a fixed height for mobile to ensure proper display
    hero.style.minHeight = window.innerHeight + "px";
  } else {
    hero.style.minHeight = "auto";
  }
}

// Image loading optimization
document.addEventListener("DOMContentLoaded", function () {
  // Adjust hero for mobile
  adjustHeroForMobile();

  // Lazy load images
  const images = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.removeAttribute("data-src");
          imageObserver.unobserve(image);
        }
      });
    });

    images.forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach((img) => {
      img.src = img.dataset.src;
    });
  }

  // Enhance image interactions
  const historyImage = document.querySelector(".history-image");
  if (historyImage) {
    historyImage.addEventListener("mouseenter", () => {
      if (window.innerWidth > 768) {
        // Only apply on non-mobile
        historyImage.style.transform = "scale(1.02)";
      }
    });

    historyImage.addEventListener("mouseleave", () => {
      if (window.innerWidth > 768) {
        historyImage.style.transform = "scale(1)";
      }
    });
  }
});

// Run on load and resize
window.addEventListener("load", adjustHeroForMobile);
window.addEventListener("resize", adjustHeroForMobile);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const wrapper = document.getElementById("experienceWrapper");
  const nextBtn = document.getElementById("nextBtn");
  const cards = wrapper.querySelectorAll(".experience-card");

  let currentIndex = 0;
  let cardsPerView = 3;
  let totalCards = cards.length;

  // Update cards per view based on screen size
  function updateCardsPerView() {
    if (window.innerWidth <= 768) {
      cardsPerView = 1;
    } else if (window.innerWidth <= 992) {
      cardsPerView = 2;
    } else {
      cardsPerView = 3;
    }
  }

  // Initialize
  updateCardsPerView();

  // Handle slider functionality
  nextBtn.addEventListener("click", function () {
    // Hide current cards
    for (let i = 0; i < cardsPerView; i++) {
      const index = (currentIndex + i) % totalCards;
      cards[index].style.display = "none";
    }

    // Update current index
    currentIndex = (currentIndex + cardsPerView) % totalCards;

    // Show next set of cards
    for (let i = 0; i < cardsPerView; i++) {
      const index = (currentIndex + i) % totalCards;
      cards[index].style.display = "flex";
    }
  });

  // Show initial set of cards
  for (let i = 0; i < totalCards; i++) {
    if (i < cardsPerView) {
      cards[i].style.display = "flex";
    } else {
      cards[i].style.display = "none";
    }
  }

  // Handle window resize
  window.addEventListener("resize", function () {
    // Get previous cardsPerView
    const prevCardsPerView = cardsPerView;

    // Update cardsPerView
    updateCardsPerView();

    // If cardsPerView changed, update visible cards
    if (prevCardsPerView !== cardsPerView) {
      // Hide all cards
      for (let i = 0; i < totalCards; i++) {
        cards[i].style.display = "none";
      }

      // Reset current index
      currentIndex = 0;

      // Show first set of cards
      for (let i = 0; i < cardsPerView; i++) {
        if (i < totalCards) {
          cards[i].style.display = "flex";
        }
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const sliderBtn = document.getElementById("hotelsNextBtn");
  const wrapper = document.querySelector(".hotels-wrapper");
  const cards = wrapper.querySelectorAll(".hotel-card");

  let currentIndex = 0;
  let cardsPerView = 3;
  let totalCards = cards.length;

  // Update cards per view based on screen size
  function updateCardsPerView() {
    if (window.innerWidth <= 768) {
      cardsPerView = 1;
    } else if (window.innerWidth <= 1200) {
      cardsPerView = 2;
    } else {
      cardsPerView = 3;
    }
  }

  // Initialize
  updateCardsPerView();

  // Show only visible cards
  function updateVisibleCards() {
    cards.forEach((card, index) => {
      if (index >= currentIndex && index < currentIndex + cardsPerView) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Initial setup
  updateVisibleCards();

  // Next button click handler
  sliderBtn.addEventListener("click", function () {
    currentIndex += cardsPerView;

    // Loop back to start if reached the end
    if (currentIndex >= totalCards) {
      currentIndex = 0;
    }

    updateVisibleCards();
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    const oldCardsPerView = cardsPerView;
    updateCardsPerView();

    // Reset view if number of cards per view changed
    if (oldCardsPerView !== cardsPerView) {
      currentIndex = 0;
      updateVisibleCards();
    }
  });
});

// FAQ Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const toggleBtn = item.querySelector(".toggle-btn");

    question.addEventListener("click", function () {
      // Close all other FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          otherItem.querySelector(".toggle-btn i").className = "fas fa-plus";
        }
      });

      // Toggle current FAQ item
      item.classList.toggle("active");

      // Update icon
      const icon = toggleBtn.querySelector("i");
      if (item.classList.contains("active")) {
        icon.className = "fas fa-minus";
      } else {
        icon.className = "fas fa-plus";
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const slider = document.getElementById("attractionsSlider");
  const prevBtn = document.getElementById("attractionsPrevBtn");
  const nextBtn = document.getElementById("attractionsNextBtn");
  const cards = document.querySelectorAll(".attraction-card");

  // Variables
  let currentIndex = 0;
  let cardsPerView = 4;
  let totalCards = cards.length;

  // Function to determine cards per view based on window width
  function updateCardsPerView() {
    if (window.innerWidth <= 576) {
      cardsPerView = 1;
    } else if (window.innerWidth <= 992) {
      cardsPerView = 2;
    } else if (window.innerWidth <= 1200) {
      cardsPerView = 3;
    } else {
      cardsPerView = 4;
    }
  }

  // Function to update visible cards
  function updateVisibleCards() {
    cards.forEach((card, index) => {
      if (index >= currentIndex && index < currentIndex + cardsPerView) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });

    updateButtonStates();
  }

  // Update button states
  function updateButtonStates() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex + cardsPerView >= totalCards;

    prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
    nextBtn.style.opacity =
      currentIndex + cardsPerView >= totalCards ? "0.5" : "1";
  }

  // Handle next button click
  nextBtn.addEventListener("click", function () {
    if (currentIndex + cardsPerView < totalCards) {
      currentIndex++;
      updateVisibleCards();
    }
  });

  // Handle prev button click
  prevBtn.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateVisibleCards();
    }
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    const oldCardsPerView = cardsPerView;
    updateCardsPerView();

    // Reset the slider if number of cards per view changes
    if (oldCardsPerView !== cardsPerView) {
      currentIndex = 0;
      updateVisibleCards();
    }
  });

  // Initialize
  updateCardsPerView();
  updateVisibleCards();
});

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const slider = document.getElementById("beyondSlider");
  const prevBtn = document.getElementById("beyondPrevBtn");
  const nextBtn = document.getElementById("beyondNextBtn");
  const cards = document.querySelectorAll(".tower-card");

  // Variables
  let currentIndex = 0;
  let cardsPerView = 4;
  let totalCards = cards.length;

  // Function to determine cards per view based on window width
  function updateCardsPerView() {
    if (window.innerWidth <= 576) {
      cardsPerView = 1;
    } else if (window.innerWidth <= 992) {
      cardsPerView = 2;
    } else if (window.innerWidth <= 1200) {
      cardsPerView = 3;
    } else {
      cardsPerView = 4;
    }
  }

  // Function to update visible cards
  function updateVisibleCards() {
    cards.forEach((card, index) => {
      if (index >= currentIndex && index < currentIndex + cardsPerView) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });

    updateButtonStates();
  }

  // Update button states
  function updateButtonStates() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex + cardsPerView >= totalCards;

    prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
    nextBtn.style.opacity =
      currentIndex + cardsPerView >= totalCards ? "0.5" : "1";
  }

  // Handle next button click
  nextBtn.addEventListener("click", function () {
    if (currentIndex + cardsPerView < totalCards) {
      currentIndex++;
      updateVisibleCards();
    }
  });

  // Handle prev button click
  prevBtn.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateVisibleCards();
    }
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    const oldCardsPerView = cardsPerView;
    updateCardsPerView();

    // Reset the slider if number of cards per view changes
    if (oldCardsPerView !== cardsPerView) {
      currentIndex = 0;
      updateVisibleCards();
    }
  });

  // Initialize
  updateCardsPerView();
  updateVisibleCards();
});
