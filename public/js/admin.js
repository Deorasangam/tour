// Admin Panel JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Sidebar Toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  const mobileSidebarToggle = document.getElementById("mobileSidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const body = document.body;

  // Function to toggle sidebar
  function toggleSidebar() {
    sidebar.classList.toggle("expanded");

    // Add overlay on mobile
    if (window.innerWidth < 768) {
      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      if (sidebar.classList.contains("expanded")) {
        overlay.classList.add("active");
        body.appendChild(overlay);

        // Close sidebar when clicking outside
        overlay.addEventListener("click", function () {
          sidebar.classList.remove("expanded");
          overlay.remove();
        });
      } else {
        const existingOverlay = document.querySelector(".overlay");
        if (existingOverlay) {
          existingOverlay.remove();
        }
      }
    }
  }

  // Desktop sidebar toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");

      // Adjust main content margin
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        if (sidebar.classList.contains("collapsed")) {
          mainContent.style.marginLeft = "var(--sidebar-collapsed-width)";
        } else {
          mainContent.style.marginLeft = "var(--sidebar-width)";
        }
      }
    });
  }

  // Mobile sidebar toggle
  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener("click", toggleSidebar);
  }

  // User Dropdown
  const userDropdownToggle = document.querySelector(".user-dropdown-toggle");
  const userDropdown = document.querySelector(".user-dropdown");

  if (userDropdownToggle && userDropdown) {
    userDropdownToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function () {
      userDropdown.classList.remove("active");
    });
  }

  // Section Management
  const deleteSectionBtns = document.querySelectorAll(".delete-section-btn");
  const toggleSectionBtns = document.querySelectorAll(".toggle-section-btn");

  // Delete section confirmation
  if (deleteSectionBtns.length > 0) {
    deleteSectionBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const sectionId = this.dataset.id;
        const sectionName = this.dataset.name;

        Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete the "${sectionName}" section. This action cannot be undone.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "var(--error-color)",
          cancelButtonColor: "var(--primary-color)",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            // Send delete request
            fetch(`/api/sections/${sectionId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  Swal.fire(
                    "Deleted!",
                    `The ${sectionName} section has been deleted.`,
                    "success"
                  ).then(() => {
                    window.location.reload();
                  });
                } else {
                  Swal.fire(
                    "Error",
                    data.message || "Failed to delete section.",
                    "error"
                  );
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                Swal.fire(
                  "Error",
                  "An error occurred while deleting the section.",
                  "error"
                );
              });
          }
        });
      });
    });
  }

  // Toggle section active/inactive
  if (toggleSectionBtns.length > 0) {
    toggleSectionBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const sectionId = this.dataset.id;
        const isActive = this.dataset.active === "true";
        const sectionName = this.dataset.name;

        // Send update request
        fetch(`/api/sections/${sectionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !isActive,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const status = !isActive ? "activated" : "deactivated";
              Swal.fire(
                "Updated!",
                `The ${sectionName} section has been ${status}.`,
                "success"
              ).then(() => {
                window.location.reload();
              });
            } else {
              Swal.fire(
                "Error",
                data.message || "Failed to update section status.",
                "error"
              );
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire(
              "Error",
              "An error occurred while updating the section.",
              "error"
            );
          });
      });
    });
  }

  // Image Preview for file inputs
  const imageInputs = document.querySelectorAll(".image-upload-input");

  if (imageInputs.length > 0) {
    imageInputs.forEach((input) => {
      input.addEventListener("change", function () {
        const previewContainer = document.querySelector(
          `#${this.dataset.preview}`
        );
        if (!previewContainer) return;

        if (this.files && this.files[0]) {
          const reader = new FileReader();

          reader.onload = function (e) {
            previewContainer.innerHTML = `
              <img src="${e.target.result}" alt="Preview">
              <div class="image-preview-remove" data-input="${input.id}">
                <i class="fas fa-times"></i>
              </div>
            `;

            // Add event listener to remove button
            const removeBtn = previewContainer.querySelector(
              ".image-preview-remove"
            );
            if (removeBtn) {
              removeBtn.addEventListener("click", function () {
                const inputId = this.dataset.input;
                const input = document.getElementById(inputId);
                if (input) {
                  input.value = "";
                  previewContainer.innerHTML = `
                    <div class="image-preview-placeholder">
                      <i class="fas fa-image"></i>
                      <div>No image selected</div>
                    </div>
                  `;
                }
              });
            }
          };

          reader.readAsDataURL(this.files[0]);
        } else {
          previewContainer.innerHTML = `
            <div class="image-preview-placeholder">
              <i class="fas fa-image"></i>
              <div>No image selected</div>
            </div>
          `;
        }
      });
    });
  }

  // Sortable sections for reordering
  const sortableSections = document.getElementById("sortableSections");

  if (sortableSections && typeof Sortable !== "undefined") {
    new Sortable(sortableSections, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: function () {
        // Update section order when dragging ends
        const sectionItems = sortableSections.querySelectorAll(".section-item");
        const sectionsData = [];

        sectionItems.forEach((item, index) => {
          sectionsData.push({
            id: item.dataset.id,
            order: index + 1,
          });
        });

        // Save new order to the server
        fetch("/api/sections/reorder", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sections: sectionsData }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Update order numbers displayed
              sectionItems.forEach((item, index) => {
                const orderElement = item.querySelector(".section-order");
                if (orderElement) {
                  orderElement.textContent = `Order: ${index + 1}`;
                }
              });

              // Show success notification
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Section order updated",
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "Failed to update section order.",
              });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "An error occurred while updating section order.",
            });
          });
      },
    });
  }

  // Handle form submissions with proper JSON formatting
  const ajaxForms = document.querySelectorAll("form[data-method]");

  ajaxForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const method = this.getAttribute("data-method");
      const url = this.action;
      const redirectUrl = this.getAttribute("data-redirect");

      // Convert form data to appropriate JSON structure
      const formData = new FormData(this);
      const formObject = {};

      formData.forEach((value, key) => {
        // Special handling for nested properties (dot notation)
        if (key.includes(".")) {
          const parts = key.split(".");
          let obj = formObject;

          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];

            // Handle array notation (e.g., keyPoints[0])
            const arrayMatch = part.match(/^([^\[]+)\[(\d+)\]$/);
            if (arrayMatch) {
              const arrayName = arrayMatch[1];
              const arrayIndex = parseInt(arrayMatch[2]);

              if (!obj[arrayName]) obj[arrayName] = [];
              if (!obj[arrayName][arrayIndex]) obj[arrayName][arrayIndex] = {};

              obj = obj[arrayName][arrayIndex];
            } else {
              if (!obj[part]) obj[part] = {};
              obj = obj[part];
            }
          }

          obj[parts[parts.length - 1]] = value;
        } else {
          formObject[key] = value;
        }
      });

      // Log the form data object for debugging
      console.log("Submitting form data:", formObject);

      // Show loading state
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we save your changes",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Send the data
      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            Swal.fire({
              icon: "success",
              title: "Success!",
              text: "Changes saved successfully",
            }).then(() => {
              if (redirectUrl) {
                window.location.href = redirectUrl;
              } else {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: data.message || "An error occurred while saving",
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "An unexpected error occurred",
          });
        });
    });
  });

  // Handle image uploads for section content
  const imageUploadForms = document.querySelectorAll(".image-upload-form");

  if (imageUploadForms.length > 0) {
    imageUploadForms.forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        let actionUrl = this.getAttribute("action");

        // Get the current section name from the page
        const sectionDisplayName = document
          .querySelector(".card-title")
          .textContent.trim();

        // Check if any file is selected
        const fileInput = this.querySelector('input[type="file"]');
        if (!fileInput.files.length) {
          Swal.fire({
            icon: "error",
            title: "No file selected",
            text: "Please select an image to upload.",
          });
          return;
        }

        // Determine content type based on section
        let contentType = "general";
        if (sectionDisplayName.includes("Hero")) {
          contentType = "background";
        } else if (sectionDisplayName.includes("History")) {
          contentType = "history";
        } else if (sectionDisplayName.includes("Architecture")) {
          contentType = "architecture";
        } else if (sectionDisplayName.includes("Observation")) {
          const uploadBtn = document.querySelector(
            '.upload-deck-image[data-clicked="true"]'
          );
          if (uploadBtn) {
            const deckIndex = uploadBtn.getAttribute("data-index");
            contentType = `deck-${deckIndex}`;
          } else {
            contentType = "deck";
          }
        }

        // Add content type parameter to the URL
        if (actionUrl.includes("?")) {
          actionUrl += `&type=${contentType}`;
        } else {
          actionUrl += `?type=${contentType}`;
        }

        Swal.fire({
          title: "Uploading...",
          text: "Please wait while we upload your image",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        fetch(actionUrl, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                icon: "success",
                title: "Uploaded!",
                text: "Your image has been uploaded successfully.",
              });

              // Set the image URL to the corresponding input field
              const modal = document.getElementById("imageUploadModal");
              if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
              }

              // Determine which input to update based on context
              let targetInput;

              // Check for hero section's background image
              if (sectionDisplayName.includes("Hero")) {
                targetInput = document.getElementById(
                  "content_backgroundImage"
                );
              } else if (sectionDisplayName.includes("Observation")) {
                // For observation decks, we need to determine which deck's image to update
                // Look for a data attribute on the form or a nearby element that indicates the deck index
                const uploadBtn = document.querySelector(
                  '.upload-deck-image[data-clicked="true"]'
                );
                if (uploadBtn) {
                  const deckIndex = uploadBtn.getAttribute("data-index");
                  targetInput = document.querySelector(
                    `input[name="content.decks[${deckIndex}].image"]`
                  );
                  // Reset the clicked attribute
                  uploadBtn.removeAttribute("data-clicked");
                }
              } else {
                // Default to content_image for other sections with single image
                targetInput = document.getElementById("content_image");
              }

              if (targetInput) {
                targetInput.value = data.file.fullPath;

                // Also update any preview images
                const previewContainer = targetInput
                  .closest(".form-group")
                  .querySelector(".image-preview");
                if (previewContainer) {
                  previewContainer.innerHTML = `<img src="${data.file.fullPath}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
                } else {
                  // Create a preview if it doesn't exist
                  const inputGroup = targetInput.closest(".input-group");
                  if (inputGroup) {
                    const newPreview = document.createElement("div");
                    newPreview.className = "image-preview mt-2";
                    newPreview.innerHTML = `<img src="${data.file.fullPath}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
                    inputGroup.parentNode.appendChild(newPreview);
                  }
                }
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text:
                  data.message ||
                  "An error occurred while uploading your image.",
              });
            }
          })
          .catch((err) => {
            console.error("Error uploading image:", err);
            Swal.fire({
              icon: "error",
              title: "Upload Failed",
              text: "An error occurred while uploading your image.",
            });
          });
      });
    });
  }

  // Handle navigation menu items for Header & Navigation section
  const menuItemsContainer = document.getElementById("menuItemsContainer");
  const addMenuItemBtn = document.getElementById("addMenuItem");

  if (addMenuItemBtn && menuItemsContainer) {
    // Initialize sorting for menu items
    new Sortable(menuItemsContainer, {
      handle: ".menu-item-handle",
      animation: 150,
      onEnd: function () {
        // Update order inputs when items are reordered
        updateMenuItemOrders();
      },
    });

    // Add new menu item
    addMenuItemBtn.addEventListener("click", function () {
      const itemIndex = document.querySelectorAll(".menu-item").length;
      const newItem = document.createElement("div");
      newItem.className = "menu-item card mb-3";
      newItem.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span class="menu-item-handle me-2"><i class="fas fa-grip-vertical"></i></span>
            <h5 class="mb-0">New Menu Item</h5>
          </div>
          <button type="button" class="btn btn-sm btn-danger remove-menu-item">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-5">
              <div class="form-group mb-3">
                <label class="form-label">Menu Text</label>
                <input
                  type="text"
                  name="content.menuItems[${itemIndex}].text"
                  class="form-control"
                  value=""
                  required
                />
              </div>
            </div>
            <div class="col-md-5">
              <div class="form-group mb-3">
                <label class="form-label">URL / Link</label>
                <input
                  type="text"
                  name="content.menuItems[${itemIndex}].url"
                  class="form-control"
                  value="#"
                  placeholder="e.g., /about, #contact-section"
                />
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group mb-3">
                <label class="form-label">Order</label>
                <input
                  type="number"
                  name="content.menuItems[${itemIndex}].order"
                  class="form-control menu-item-order"
                  value="${itemIndex + 1}"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>
      `;
      menuItemsContainer.appendChild(newItem);

      // Remove any "no items" message if it exists
      const noItemsMsg = menuItemsContainer.querySelector(".alert");
      if (noItemsMsg) {
        noItemsMsg.remove();
      }

      // Add event listener to the new remove button
      const removeBtn = newItem.querySelector(".remove-menu-item");
      removeBtn.addEventListener("click", handleRemoveMenuItem);
    });

    // Handle click on existing remove buttons
    document.querySelectorAll(".remove-menu-item").forEach((btn) => {
      btn.addEventListener("click", handleRemoveMenuItem);
    });

    // Function to handle removing a menu item
    function handleRemoveMenuItem() {
      Swal.fire({
        title: "Remove Menu Item?",
        text: "Are you sure you want to remove this navigation menu item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, remove it!",
      }).then((result) => {
        if (result.isConfirmed) {
          // Remove the menu item
          this.closest(".menu-item").remove();

          // If no items left, add a message
          if (menuItemsContainer.querySelectorAll(".menu-item").length === 0) {
            menuItemsContainer.innerHTML = `
              <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> No menu items have been added yet. Click "Add Menu Item" to create your navigation menu.
              </div>
            `;
          } else {
            // Update the indices for remaining items
            updateMenuItemIndices();
          }
        }
      });
    }

    // Update menu item indices after removal
    function updateMenuItemIndices() {
      const menuItems = menuItemsContainer.querySelectorAll(".menu-item");
      menuItems.forEach((item, index) => {
        const inputs = item.querySelectorAll(
          'input[name^="content.menuItems["]'
        );
        inputs.forEach((input) => {
          const name = input.name;
          const newName = name.replace(
            /content\.menuItems\[\d+\]/,
            `content.menuItems[${index}]`
          );
          input.name = newName;
        });
      });
    }

    // Update menu item order values based on their position
    function updateMenuItemOrders() {
      const menuItems = menuItemsContainer.querySelectorAll(".menu-item");
      menuItems.forEach((item, index) => {
        const orderInput = item.querySelector(".menu-item-order");
        if (orderInput) {
          orderInput.value = index + 1;
        }
      });
    }
  }
});
