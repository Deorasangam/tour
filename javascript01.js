// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all sliders
  initializeSlider(".contact-slider", ".contact-cards");
  initializeSlider(".attractions-slider", ".attraction-cards");
  initializeSlider(".experiences-slider", ".experience-cards");
  initializeSlider(".tours-slider", ".tour-cards");
  initializeSlider(".historical-slider", ".historical-cards");

  // Initialize FAQ functionality
  initializeFAQ();

  // Initialize category sections
  initializeCategorySections();
});

// Slider functionality
function initializeSlider(sliderClass, cardsClass) {
  const slider = document.querySelector(sliderClass);
  if (!slider) return;

  const cards = slider.querySelector(cardsClass);
  const prevBtn = slider.querySelector(".slider-button.prev");
  const nextBtn = slider.querySelector(".slider-button.next");

  if (!cards || !prevBtn || !nextBtn) return;

  let currentPosition = 0;
  const cardWidth = cards.firstElementChild.offsetWidth;
  const gap = 10; // Gap between cards
  const cardsToShow =
    window.innerWidth > 1200 ? 4 : window.innerWidth > 768 ? 3 : 1;
  const maxPosition =
    -(cards.children.length - cardsToShow) * (cardWidth + gap);

  // Add transition style
  cards.style.transition = "transform 0.3s ease";

  // Update slider position
  function updateSliderPosition() {
    cards.style.transform = `translateX(${currentPosition}px)`;
  }

  // Next button click
  nextBtn.addEventListener("click", () => {
    if (currentPosition > maxPosition) {
      currentPosition -= cardWidth + gap;
      updateSliderPosition();
    }
  });

  // Previous button click
  prevBtn.addEventListener("click", () => {
    if (currentPosition < 0) {
      currentPosition += cardWidth + gap;
      updateSliderPosition();
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    const newCardWidth = cards.firstElementChild.offsetWidth;
    const newCardsToShow =
      window.innerWidth > 1200 ? 4 : window.innerWidth > 768 ? 3 : 1;
    const newMaxPosition =
      -(cards.children.length - newCardsToShow) * (newCardWidth + gap);

    // Adjust current position if needed
    if (currentPosition < newMaxPosition) {
      currentPosition = newMaxPosition;
    }
    if (currentPosition > 0) {
      currentPosition = 0;
    }

    updateSliderPosition();
  });
}

// FAQ functionality
function initializeFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item, index) => {
    const question = item.querySelector(".faq-question");
    const toggleBtn = item.querySelector(".toggle-btn");
    const answer = item.querySelector(".faq-answer");

    if (!question || !toggleBtn || !answer) return;

    // Set initial state
    answer.style.maxHeight = "0px";
    answer.style.overflow = "hidden";
    answer.style.transition = "max-height 0.3s ease";

    // Make first FAQ item open by default
    if (index === 0) {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-plus");
        icon.classList.add("fa-minus");
      }
    }

    question.addEventListener("click", () => {
      // Close all other FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
          const otherAnswer = otherItem.querySelector(".faq-answer");
          const otherToggleBtn = otherItem.querySelector(".toggle-btn i");
          if (otherAnswer && otherToggleBtn) {
            otherAnswer.style.maxHeight = "0px";
            otherToggleBtn.classList.remove("fa-minus");
            otherToggleBtn.classList.add("fa-plus");
          }
        }
      });

      // Toggle current FAQ item
      const isActive = item.classList.contains("active");
      item.classList.toggle("active");

      // Update answer height
      if (!isActive) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        answer.style.maxHeight = "0px";
      }

      // Update icon
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        if (!isActive) {
          icon.classList.remove("fa-plus");
          icon.classList.add("fa-minus");
        } else {
          icon.classList.remove("fa-minus");
          icon.classList.add("fa-plus");
        }
      }
    });
  });
}

// Category sections functionality
function initializeCategorySections() {
  const categoryItems = document.querySelectorAll(".category-item");

  categoryItems.forEach((item) => {
    const header = item.querySelector(".category-header");
    const toggleBtn = item.querySelector(".toggle-btn");
    const content = item.querySelector(".category-content");

    if (!header || !toggleBtn || !content) return;

    // Set initial state
    content.style.maxHeight = "0px";
    content.style.overflow = "hidden";
    content.style.transition = "max-height 0.3s ease";

    header.addEventListener("click", () => {
      // Close all other category items
      categoryItems.forEach((otherItem) => {
        if (
          otherItem !== item &&
          otherItem
            .querySelector(".category-content")
            .classList.contains("active")
        ) {
          const otherContent = otherItem.querySelector(".category-content");
          const otherToggleBtn = otherItem.querySelector(".toggle-btn");
          if (otherContent && otherToggleBtn) {
            otherContent.classList.remove("active");
            otherContent.style.maxHeight = "0px";
            otherToggleBtn.classList.remove("active");
          }
        }
      });

      // Toggle current category item
      const isActive = content.classList.contains("active");
      content.classList.toggle("active");
      toggleBtn.classList.toggle("active");

      // Update content height
      if (!isActive) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = "0px";
      }
    });
  });
}
