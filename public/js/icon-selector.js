// Font Awesome Icon Selector Component
document.addEventListener("DOMContentLoaded", function () {
  // Create and append the icon selector modal to the body
  const modalHtml = `
    <div id="iconSelectorModal" class="icon-selector-modal">
      <div class="icon-selector-content">
        <div class="icon-selector-header">
          <h3>Select an Icon</h3>
          <button id="closeIconSelector" class="close-icon-selector">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="icon-selector-search">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input type="text" id="iconSearchInput" placeholder="Search icons (e.g. 'calendar', 'user')">
            <button id="clearIconSearch" class="clear-search-btn">
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        </div>
        <div class="icon-recent-section">
          <h4 class="recent-title">Recently Used</h4>
          <div class="recent-icons" id="recentIcons">
            <!-- Recent icons will be loaded here -->
          </div>
        </div>
        <div class="icon-category-tabs">
          <button class="icon-category-tab active" data-category="all">All</button>
          <button class="icon-category-tab" data-category="solid">Solid</button>
          <button class="icon-category-tab" data-category="regular">Regular</button>
          <button class="icon-category-tab" data-category="brands">Brands</button>
          <button class="icon-category-tab" data-category="custom">Custom</button>
        </div>
        <div id="customIconsSection" class="custom-icons-section" style="display: none;">
          <div class="custom-icons-actions">
            <div class="custom-icons-upload">
              <label for="customIconUpload" class="btn btn-outline-primary">
                <i class="fas fa-upload"></i> Upload Icon
              </label>
              <input type="file" id="customIconUpload" accept="image/svg+xml,image/png,image/jpeg,image/gif" style="display: none;">
            </div>
            <div class="custom-icons-url">
              <div class="input-group">
                <input type="text" id="customIconUrl" class="form-control" placeholder="Enter icon URL">
                <button id="addCustomIconUrl" class="btn btn-primary">Add</button>
              </div>
            </div>
          </div>
          <div id="customIconsGrid" class="custom-icons-grid">
            <!-- Custom icons will be displayed here -->
            <div class="no-custom-icons">
              <i class="fas fa-info-circle"></i>
              <p>No custom icons added yet. Upload or add URL above.</p>
            </div>
          </div>
        </div>
        <div class="icon-selector-grid" id="iconGrid">
          <!-- Icons will be dynamically loaded here -->
          <div class="icon-grid-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading icons...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // References to DOM elements
  const modal = document.getElementById("iconSelectorModal");
  const closeButton = document.getElementById("closeIconSelector");
  const searchInput = document.getElementById("iconSearchInput");
  const clearSearchButton = document.getElementById("clearIconSearch");
  const iconGrid = document.getElementById("iconGrid");
  const categoryTabs = document.querySelectorAll(".icon-category-tab");
  const recentIconsContainer = document.getElementById("recentIcons");

  // Custom icons elements
  const customIconsSection = document.getElementById("customIconsSection");
  const customIconsGrid = document.getElementById("customIconsGrid");
  const customIconUpload = document.getElementById("customIconUpload");
  const customIconUrl = document.getElementById("customIconUrl");
  const addCustomIconUrl = document.getElementById("addCustomIconUrl");

  // Create error message container if it doesn't exist
  if (customIconsSection && !document.getElementById("custom-icon-error")) {
    const errorElem = document.createElement("div");
    errorElem.id = "custom-icon-error";
    errorElem.className = "custom-icon-error";
    errorElem.style.display = "none";
    customIconsSection.appendChild(errorElem);
  }

  // Maximum number of recent icons to store
  const MAX_RECENT_ICONS = 12;

  // Custom icons storage key
  const CUSTOM_ICONS_STORAGE_KEY = "customIcons";

  // Icon data - This would ideally be loaded from a JSON file or API
  // For this implementation, we'll include a sample of popular icons
  // In a production environment, consider loading this from a separate file
  const iconData = {
    solid: [
      { name: "address-book", unicode: "f2b9" },
      { name: "address-card", unicode: "f2bb" },
      { name: "adjust", unicode: "f042" },
      { name: "alarm-clock", unicode: "f34e" },
      { name: "anchor", unicode: "f13d" },
      { name: "angle-double-down", unicode: "f103" },
      { name: "angle-double-left", unicode: "f100" },
      { name: "angle-double-right", unicode: "f101" },
      { name: "angle-double-up", unicode: "f102" },
      { name: "angle-down", unicode: "f107" },
      { name: "angle-left", unicode: "f104" },
      { name: "angle-right", unicode: "f105" },
      { name: "angle-up", unicode: "f106" },
      { name: "archive", unicode: "f187" },
      { name: "arrow-alt-circle-down", unicode: "f358" },
      { name: "arrow-alt-circle-left", unicode: "f359" },
      { name: "arrow-alt-circle-right", unicode: "f35a" },
      { name: "arrow-alt-circle-up", unicode: "f35b" },
      { name: "arrow-circle-down", unicode: "f0ab" },
      { name: "arrow-circle-left", unicode: "f0a8" },
      { name: "arrow-circle-right", unicode: "f0a9" },
      { name: "arrow-circle-up", unicode: "f0aa" },
      { name: "arrow-down", unicode: "f063" },
      { name: "arrow-left", unicode: "f060" },
      { name: "arrow-right", unicode: "f061" },
      { name: "arrow-up", unicode: "f062" },
      { name: "calendar", unicode: "f133" },
      { name: "calendar-alt", unicode: "f073" },
      { name: "calendar-check", unicode: "f274" },
      { name: "calendar-day", unicode: "f783" },
      { name: "calendar-minus", unicode: "f272" },
      { name: "calendar-plus", unicode: "f271" },
      { name: "calendar-times", unicode: "f273" },
      { name: "calendar-week", unicode: "f784" },
      { name: "chart-bar", unicode: "f080" },
      { name: "chart-line", unicode: "f201" },
      { name: "chart-pie", unicode: "f200" },
      { name: "check", unicode: "f00c" },
      { name: "check-circle", unicode: "f058" },
      { name: "check-square", unicode: "f14a" },
      { name: "circle", unicode: "f111" },
      { name: "clock", unicode: "f017" },
      { name: "cog", unicode: "f013" },
      { name: "cogs", unicode: "f085" },
      { name: "comment", unicode: "f075" },
      { name: "comments", unicode: "f086" },
      { name: "credit-card", unicode: "f09d" },
      { name: "desktop", unicode: "f108" },
      { name: "download", unicode: "f019" },
      { name: "edit", unicode: "f044" },
      { name: "envelope", unicode: "f0e0" },
      { name: "exclamation", unicode: "f12a" },
      { name: "exclamation-circle", unicode: "f06a" },
      { name: "exclamation-triangle", unicode: "f071" },
      { name: "eye", unicode: "f06e" },
      { name: "eye-slash", unicode: "f070" },
      { name: "file", unicode: "f15b" },
      { name: "file-alt", unicode: "f15c" },
      { name: "filter", unicode: "f0b0" },
      { name: "folder", unicode: "f07b" },
      { name: "folder-open", unicode: "f07c" },
      { name: "globe", unicode: "f0ac" },
      { name: "globe-americas", unicode: "f57d" },
      { name: "hand-point-down", unicode: "f0a7" },
      { name: "hand-point-left", unicode: "f0a5" },
      { name: "hand-point-right", unicode: "f0a4" },
      { name: "hand-point-up", unicode: "f0a6" },
      { name: "heart", unicode: "f004" },
      { name: "home", unicode: "f015" },
      { name: "image", unicode: "f03e" },
      { name: "images", unicode: "f302" },
      { name: "info", unicode: "f129" },
      { name: "info-circle", unicode: "f05a" },
      { name: "key", unicode: "f084" },
      { name: "lightbulb", unicode: "f0eb" },
      { name: "link", unicode: "f0c1" },
      { name: "list", unicode: "f03a" },
      { name: "list-alt", unicode: "f022" },
      { name: "list-ol", unicode: "f0cb" },
      { name: "list-ul", unicode: "f0ca" },
      { name: "lock", unicode: "f023" },
      { name: "lock-open", unicode: "f3c1" },
      { name: "map", unicode: "f279" },
      { name: "map-marker", unicode: "f041" },
      { name: "map-marker-alt", unicode: "f3c5" },
      { name: "minus", unicode: "f068" },
      { name: "minus-circle", unicode: "f056" },
      { name: "minus-square", unicode: "f146" },
      { name: "mobile", unicode: "f10b" },
      { name: "money-bill", unicode: "f0d6" },
      { name: "paper-plane", unicode: "f1d8" },
      { name: "paperclip", unicode: "f0c6" },
      { name: "paste", unicode: "f0ea" },
      { name: "pause", unicode: "f04c" },
      { name: "pencil-alt", unicode: "f303" },
      { name: "phone", unicode: "f095" },
      { name: "phone-alt", unicode: "f879" },
      { name: "play", unicode: "f04b" },
      { name: "plus", unicode: "f067" },
      { name: "plus-circle", unicode: "f055" },
      { name: "plus-square", unicode: "f0fe" },
      { name: "print", unicode: "f02f" },
      { name: "question", unicode: "f128" },
      { name: "question-circle", unicode: "f059" },
      { name: "redo", unicode: "f01e" },
      { name: "redo-alt", unicode: "f2f9" },
      { name: "save", unicode: "f0c7" },
      { name: "search", unicode: "f002" },
      { name: "share", unicode: "f064" },
      { name: "share-alt", unicode: "f1e0" },
      { name: "shield-alt", unicode: "f3ed" },
      { name: "shopping-cart", unicode: "f07a" },
      { name: "sign-in-alt", unicode: "f2f6" },
      { name: "sign-out-alt", unicode: "f2f5" },
      { name: "spinner", unicode: "f110" },
      { name: "star", unicode: "f005" },
      { name: "star-half", unicode: "f089" },
      { name: "sync", unicode: "f021" },
      { name: "tag", unicode: "f02b" },
      { name: "tags", unicode: "f02c" },
      { name: "tasks", unicode: "f0ae" },
      { name: "thumbs-down", unicode: "f165" },
      { name: "thumbs-up", unicode: "f164" },
      { name: "times", unicode: "f00d" },
      { name: "times-circle", unicode: "f057" },
      { name: "trash", unicode: "f1f8" },
      { name: "trash-alt", unicode: "f2ed" },
      { name: "undo", unicode: "f0e2" },
      { name: "undo-alt", unicode: "f2ea" },
      { name: "unlock", unicode: "f09c" },
      { name: "unlock-alt", unicode: "f13e" },
      { name: "upload", unicode: "f093" },
      { name: "user", unicode: "f007" },
      { name: "user-alt", unicode: "f406" },
      { name: "user-circle", unicode: "f2bd" },
      { name: "users", unicode: "f0c0" },
      { name: "wrench", unicode: "f0ad" },
      // Additional solid icons
      { name: "ad", unicode: "f641" },
      { name: "address-card", unicode: "f2bb" },
      { name: "air-freshener", unicode: "f5d0" },
      { name: "allergies", unicode: "f461" },
      { name: "ambulance", unicode: "f0f9" },
      { name: "american-sign-language-interpreting", unicode: "f2a3" },
      { name: "ankh", unicode: "f644" },
      { name: "apple-alt", unicode: "f5d1" },
      { name: "archway", unicode: "f557" },
      { name: "atlas", unicode: "f558" },
      { name: "atom", unicode: "f5d2" },
      { name: "award", unicode: "f559" },
      { name: "baby", unicode: "f77c" },
      { name: "baby-carriage", unicode: "f77d" },
      { name: "backspace", unicode: "f55a" },
      { name: "badge", unicode: "f335" },
      { name: "badge-check", unicode: "f336" },
      { name: "balance-scale", unicode: "f24e" },
      { name: "ban", unicode: "f05e" },
      { name: "band-aid", unicode: "f462" },
      { name: "barcode", unicode: "f02a" },
      { name: "bath", unicode: "f2cd" },
      { name: "battery-empty", unicode: "f244" },
      { name: "battery-full", unicode: "f240" },
      { name: "battery-half", unicode: "f242" },
      { name: "battery-quarter", unicode: "f243" },
      { name: "battery-three-quarters", unicode: "f241" },
      { name: "bed", unicode: "f236" },
      { name: "beer", unicode: "f0fc" },
      { name: "bezier-curve", unicode: "f55b" },
      { name: "bicycle", unicode: "f206" },
      { name: "biking", unicode: "f84a" },
      { name: "binoculars", unicode: "f1e5" },
      { name: "birthday-cake", unicode: "f1fd" },
      { name: "blender", unicode: "f517" },
      { name: "bomb", unicode: "f1e2" },
      { name: "bone", unicode: "f5d7" },
      { name: "bong", unicode: "f55c" },
      { name: "book-dead", unicode: "f6b7" },
      { name: "book-medical", unicode: "f7e6" },
      { name: "book-open", unicode: "f518" },
      { name: "book-reader", unicode: "f5da" },
      { name: "bookmark", unicode: "f02e" },
      { name: "bowling-ball", unicode: "f436" },
      { name: "box", unicode: "f466" },
      { name: "box-open", unicode: "f49e" },
      { name: "boxes", unicode: "f468" },
      { name: "briefcase", unicode: "f0b1" },
      { name: "briefcase-medical", unicode: "f469" },
      { name: "brush", unicode: "f55d" },
      { name: "bug", unicode: "f188" },
      { name: "building", unicode: "f1ad" },
      { name: "bullhorn", unicode: "f0a1" },
      { name: "burger", unicode: "f805" },
      { name: "bus", unicode: "f207" },
      { name: "calculator", unicode: "f1ec" },
      { name: "camera", unicode: "f030" },
      { name: "camera-retro", unicode: "f083" },
      { name: "campground", unicode: "f6bb" },
      { name: "car", unicode: "f1b9" },
      { name: "car-alt", unicode: "f5de" },
      { name: "car-battery", unicode: "f5df" },
      { name: "car-crash", unicode: "f5e1" },
      { name: "car-side", unicode: "f5e4" },
      { name: "caravan", unicode: "f8ff" },
      { name: "cart-plus", unicode: "f217" },
      { name: "cash-register", unicode: "f788" },
      { name: "cat", unicode: "f6be" },
      { name: "certificate", unicode: "f0a3" },
      { name: "charging-station", unicode: "f5e7" },
      { name: "chess", unicode: "f439" },
      { name: "chess-bishop", unicode: "f43a" },
      { name: "chess-king", unicode: "f43f" },
      { name: "chess-knight", unicode: "f441" },
      { name: "chess-pawn", unicode: "f443" },
      { name: "chess-queen", unicode: "f445" },
      { name: "chess-rook", unicode: "f447" },
      { name: "church", unicode: "f51d" },
      { name: "city", unicode: "f64f" },
      { name: "clipboard-check", unicode: "f46c" },
      { name: "clipboard-list", unicode: "f46d" },
      { name: "cloud", unicode: "f0c2" },
      { name: "cloud-download-alt", unicode: "f381" },
      { name: "cloud-meatball", unicode: "f73b" },
      { name: "cloud-moon", unicode: "f6c3" },
      { name: "cloud-moon-rain", unicode: "f73c" },
      { name: "cloud-rain", unicode: "f73d" },
      { name: "cloud-showers-heavy", unicode: "f740" },
      { name: "cloud-sun", unicode: "f6c4" },
      { name: "cloud-sun-rain", unicode: "f743" },
      { name: "cloud-upload-alt", unicode: "f382" },
      { name: "coffee", unicode: "f0f4" },
      { name: "coins", unicode: "f51e" },
      { name: "columns", unicode: "f0db" },
      { name: "compass", unicode: "f14e" },
      { name: "cookie", unicode: "f563" },
      { name: "cookie-bite", unicode: "f564" },
      { name: "crown", unicode: "f521" },
      { name: "cube", unicode: "f1b2" },
      { name: "cubes", unicode: "f1b3" },
      { name: "cut", unicode: "f0c4" },
      { name: "database", unicode: "f1c0" },
      { name: "deaf", unicode: "f2a4" },
      { name: "dharmachakra", unicode: "f655" },
      { name: "dice", unicode: "f522" },
      { name: "dice-d20", unicode: "f6cf" },
      { name: "dice-d6", unicode: "f6d1" },
      { name: "dice-five", unicode: "f523" },
      { name: "dice-four", unicode: "f524" },
      { name: "dice-one", unicode: "f525" },
      { name: "dice-six", unicode: "f526" },
      { name: "dice-three", unicode: "f527" },
      { name: "dice-two", unicode: "f528" },
      { name: "dog", unicode: "f6d3" },
      { name: "dollar-sign", unicode: "f155" },
      { name: "dolly", unicode: "f472" },
      { name: "dove", unicode: "f4ba" },
      { name: "dragon", unicode: "f6d5" },
      { name: "drum", unicode: "f569" },
      { name: "drum-steelpan", unicode: "f56a" },
      { name: "dumbbell", unicode: "f44b" },
      { name: "egg", unicode: "f7fb" },
      { name: "ethernet", unicode: "f796" },
      { name: "euro-sign", unicode: "f153" },
      { name: "exchange-alt", unicode: "f362" },
      { name: "feather", unicode: "f52d" },
      { name: "feather-alt", unicode: "f56b" },
      { name: "fighter-jet", unicode: "f0fb" },
      { name: "fire", unicode: "f06d" },
      { name: "fire-alt", unicode: "f7e4" },
      { name: "fire-extinguisher", unicode: "f134" },
      { name: "flag-checkered", unicode: "f11e" },
      { name: "flag-usa", unicode: "f74d" },
      { name: "flask", unicode: "f0c3" },
      { name: "frog", unicode: "f52e" },
      { name: "futbol", unicode: "f1e3" },
      { name: "gamepad", unicode: "f11b" },
      { name: "gas-pump", unicode: "f52f" },
      { name: "gavel", unicode: "f0e3" },
      { name: "gem", unicode: "f3a5" },
      { name: "ghost", unicode: "f6e2" },
      { name: "gift", unicode: "f06b" },
      { name: "gifts", unicode: "f79c" },
      { name: "glass-cheers", unicode: "f79f" },
      { name: "glass-martini", unicode: "f000" },
      { name: "glass-martini-alt", unicode: "f57b" },
      { name: "glass-whiskey", unicode: "f7a0" },
      { name: "glasses", unicode: "f530" },
      { name: "globe-africa", unicode: "f57c" },
      { name: "globe-asia", unicode: "f57e" },
      { name: "globe-europe", unicode: "f7a2" },
    ],
    regular: [
      { name: "address-book", unicode: "f2b9" },
      { name: "address-card", unicode: "f2bb" },
      { name: "angry", unicode: "f556" },
      { name: "arrow-alt-circle-down", unicode: "f358" },
      { name: "arrow-alt-circle-left", unicode: "f359" },
      { name: "arrow-alt-circle-right", unicode: "f35a" },
      { name: "arrow-alt-circle-up", unicode: "f35b" },
      { name: "bell", unicode: "f0f3" },
      { name: "bell-slash", unicode: "f1f6" },
      { name: "bookmark", unicode: "f02e" },
      { name: "building", unicode: "f1ad" },
      { name: "calendar", unicode: "f133" },
      { name: "calendar-alt", unicode: "f073" },
      { name: "calendar-check", unicode: "f274" },
      { name: "calendar-minus", unicode: "f272" },
      { name: "calendar-plus", unicode: "f271" },
      { name: "calendar-times", unicode: "f273" },
      { name: "caret-square-down", unicode: "f150" },
      { name: "caret-square-left", unicode: "f191" },
      { name: "caret-square-right", unicode: "f152" },
      { name: "caret-square-up", unicode: "f151" },
      { name: "chart-bar", unicode: "f080" },
      { name: "check-circle", unicode: "f058" },
      { name: "check-square", unicode: "f14a" },
      { name: "circle", unicode: "f111" },
      { name: "clipboard", unicode: "f328" },
      { name: "clock", unicode: "f017" },
      { name: "clone", unicode: "f24d" },
      { name: "closed-captioning", unicode: "f20a" },
      { name: "comment", unicode: "f075" },
      { name: "comment-alt", unicode: "f27a" },
      { name: "comment-dots", unicode: "f4ad" },
      { name: "comments", unicode: "f086" },
      { name: "compass", unicode: "f14e" },
      { name: "copy", unicode: "f0c5" },
      { name: "copyright", unicode: "f1f9" },
      { name: "credit-card", unicode: "f09d" },
      { name: "dizzy", unicode: "f567" },
      { name: "dot-circle", unicode: "f192" },
      { name: "edit", unicode: "f044" },
      { name: "envelope", unicode: "f0e0" },
      { name: "envelope-open", unicode: "f2b6" },
      { name: "eye", unicode: "f06e" },
      { name: "eye-slash", unicode: "f070" },
      { name: "file", unicode: "f15b" },
      { name: "file-alt", unicode: "f15c" },
      { name: "file-archive", unicode: "f1c6" },
      { name: "file-audio", unicode: "f1c7" },
      { name: "file-code", unicode: "f1c9" },
      { name: "file-excel", unicode: "f1c3" },
      { name: "file-image", unicode: "f1c5" },
      { name: "file-pdf", unicode: "f1c1" },
      { name: "file-powerpoint", unicode: "f1c4" },
      { name: "file-video", unicode: "f1c8" },
      { name: "file-word", unicode: "f1c2" },
      { name: "flag", unicode: "f024" },
      { name: "flushed", unicode: "f579" },
      { name: "folder", unicode: "f07b" },
      { name: "folder-open", unicode: "f07c" },
      { name: "font-awesome-logo-full", unicode: "f4e6" },
      { name: "frown", unicode: "f119" },
      { name: "frown-open", unicode: "f57a" },
      { name: "futbol", unicode: "f1e3" },
      { name: "gem", unicode: "f3a5" },
      { name: "grimace", unicode: "f57f" },
      { name: "grin", unicode: "f580" },
      { name: "grin-alt", unicode: "f581" },
      { name: "grin-beam", unicode: "f582" },
      { name: "grin-beam-sweat", unicode: "f583" },
      { name: "grin-hearts", unicode: "f584" },
      { name: "grin-squint", unicode: "f585" },
      { name: "grin-squint-tears", unicode: "f586" },
      { name: "grin-stars", unicode: "f587" },
      { name: "grin-tears", unicode: "f588" },
      { name: "grin-tongue", unicode: "f589" },
      { name: "grin-tongue-squint", unicode: "f58a" },
      { name: "grin-tongue-wink", unicode: "f58b" },
      { name: "grin-wink", unicode: "f58c" },
      { name: "hand-lizard", unicode: "f258" },
      { name: "hand-paper", unicode: "f256" },
      { name: "hand-peace", unicode: "f25b" },
      { name: "hand-point-down", unicode: "f0a7" },
      { name: "hand-point-left", unicode: "f0a5" },
      { name: "hand-point-right", unicode: "f0a4" },
      { name: "hand-point-up", unicode: "f0a6" },
      { name: "hand-pointer", unicode: "f25a" },
      { name: "hand-rock", unicode: "f255" },
      { name: "hand-scissors", unicode: "f257" },
      { name: "hand-spock", unicode: "f259" },
      { name: "handshake", unicode: "f2b5" },
      { name: "hdd", unicode: "f0a0" },
      { name: "heart", unicode: "f004" },
      { name: "hospital", unicode: "f0f8" },
      { name: "hourglass", unicode: "f254" },
      { name: "id-badge", unicode: "f2c1" },
      { name: "id-card", unicode: "f2c2" },
      { name: "image", unicode: "f03e" },
      { name: "images", unicode: "f302" },
      { name: "keyboard", unicode: "f11c" },
      { name: "kiss", unicode: "f596" },
      { name: "kiss-beam", unicode: "f597" },
      { name: "kiss-wink-heart", unicode: "f598" },
      { name: "laugh", unicode: "f599" },
      { name: "laugh-beam", unicode: "f59a" },
      { name: "laugh-squint", unicode: "f59b" },
      { name: "laugh-wink", unicode: "f59c" },
      { name: "lemon", unicode: "f094" },
      { name: "life-ring", unicode: "f1cd" },
      { name: "lightbulb", unicode: "f0eb" },
      { name: "list-alt", unicode: "f022" },
      { name: "map", unicode: "f279" },
      { name: "meh", unicode: "f11a" },
      { name: "meh-blank", unicode: "f5a4" },
      { name: "meh-rolling-eyes", unicode: "f5a5" },
      { name: "minus-square", unicode: "f146" },
      { name: "money-bill-alt", unicode: "f3d1" },
      { name: "moon", unicode: "f186" },
      { name: "newspaper", unicode: "f1ea" },
      { name: "object-group", unicode: "f247" },
      { name: "object-ungroup", unicode: "f248" },
      { name: "paper-plane", unicode: "f1d8" },
      { name: "pause-circle", unicode: "f28b" },
      { name: "play-circle", unicode: "f144" },
      { name: "plus-square", unicode: "f0fe" },
      { name: "question-circle", unicode: "f059" },
      { name: "registered", unicode: "f25d" },
      { name: "sad-cry", unicode: "f5b3" },
      { name: "sad-tear", unicode: "f5b4" },
      { name: "save", unicode: "f0c7" },
      { name: "share-square", unicode: "f14d" },
      { name: "smile", unicode: "f118" },
      { name: "smile-beam", unicode: "f5b8" },
      { name: "smile-wink", unicode: "f4da" },
      { name: "snowflake", unicode: "f2dc" },
      { name: "square", unicode: "f0c8" },
      { name: "star", unicode: "f005" },
      { name: "star-half", unicode: "f089" },
      { name: "sticky-note", unicode: "f249" },
      { name: "stop-circle", unicode: "f28d" },
      { name: "sun", unicode: "f185" },
      { name: "surprise", unicode: "f5c2" },
      { name: "thumbs-down", unicode: "f165" },
      { name: "thumbs-up", unicode: "f164" },
      { name: "times-circle", unicode: "f057" },
      { name: "tired", unicode: "f5c8" },
      { name: "trash-alt", unicode: "f2ed" },
      { name: "user", unicode: "f007" },
      { name: "user-circle", unicode: "f2bd" },
      { name: "window-close", unicode: "f410" },
      { name: "window-maximize", unicode: "f2d0" },
      { name: "window-minimize", unicode: "f2d1" },
      { name: "window-restore", unicode: "f2d2" },
    ],
    brands: [
      { name: "amazon", unicode: "f270" },
      { name: "android", unicode: "f17b" },
      { name: "apple", unicode: "f179" },
      { name: "behance", unicode: "f1b4" },
      { name: "bitcoin", unicode: "f379" },
      { name: "bluetooth", unicode: "f293" },
      { name: "chrome", unicode: "f268" },
      { name: "discord", unicode: "f392" },
      { name: "dribbble", unicode: "f17d" },
      { name: "dropbox", unicode: "f16b" },
      { name: "edge", unicode: "f282" },
      { name: "facebook", unicode: "f09a" },
      { name: "facebook-f", unicode: "f39e" },
      { name: "firefox", unicode: "f269" },
      { name: "github", unicode: "f09b" },
      { name: "gitlab", unicode: "f296" },
      { name: "google", unicode: "f1a0" },
      { name: "google-drive", unicode: "f3aa" },
      { name: "google-play", unicode: "f3ab" },
      { name: "google-plus", unicode: "f2b3" },
      { name: "google-plus-g", unicode: "f0d5" },
      { name: "instagram", unicode: "f16d" },
      { name: "linkedin", unicode: "f08c" },
      { name: "linkedin-in", unicode: "f0e1" },
      { name: "microsoft", unicode: "f3ca" },
      { name: "npm", unicode: "f3d4" },
      { name: "paypal", unicode: "f1ed" },
      { name: "pinterest", unicode: "f0d2" },
      { name: "pinterest-p", unicode: "f231" },
      { name: "reddit", unicode: "f1a1" },
      { name: "skype", unicode: "f17e" },
      { name: "slack", unicode: "f198" },
      { name: "snapchat", unicode: "f2ab" },
      { name: "spotify", unicode: "f1bc" },
      { name: "telegram", unicode: "f2c6" },
      { name: "tiktok", unicode: "f97b" },
      { name: "trello", unicode: "f181" },
      { name: "twitch", unicode: "f1e8" },
      { name: "twitter", unicode: "f099" },
      { name: "vimeo", unicode: "f40a" },
      { name: "whatsapp", unicode: "f232" },
      { name: "wordpress", unicode: "f19a" },
      { name: "youtube", unicode: "f167" },
    ],
    custom: [],
  };

  // Current state
  let currentCategory = "all";
  let currentSearch = "";
  let hiddenInputField = null;
  let targetPreview = null;
  let customIcons = [];

  // Load recent icons from localStorage
  function getRecentIcons() {
    try {
      const recentIcons = localStorage.getItem("recentIcons");
      return recentIcons ? JSON.parse(recentIcons) : [];
    } catch (err) {
      console.error("Error loading recent icons from localStorage:", err);
      return [];
    }
  }

  // Save recent icons to localStorage
  function saveRecentIcon(iconClass) {
    try {
      let recentIcons = getRecentIcons();

      // Remove the icon if it already exists to avoid duplicates
      recentIcons = recentIcons.filter((icon) => icon !== iconClass);

      // Add the new icon to the beginning of the array
      recentIcons.unshift(iconClass);

      // Limit the number of recent icons
      if (recentIcons.length > MAX_RECENT_ICONS) {
        recentIcons = recentIcons.slice(0, MAX_RECENT_ICONS);
      }

      localStorage.setItem("recentIcons", JSON.stringify(recentIcons));
    } catch (err) {
      console.error("Error saving recent icons to localStorage:", err);
    }
  }

  // Render recent icons
  function renderRecentIcons() {
    const recentIcons = getRecentIcons();
    recentIconsContainer.innerHTML = "";

    if (recentIcons.length === 0) {
      recentIconsContainer.innerHTML =
        "<div class='no-recent-icons'>No recent icons</div>";
      return;
    }

    recentIcons.forEach((iconClass) => {
      const iconElement = document.createElement("div");
      iconElement.className = "icon-item recent-icon";
      iconElement.innerHTML = `
        <div class="icon-display">
          <i class="${iconClass}"></i>
        </div>
      `;

      iconElement.addEventListener("click", () => selectIcon(iconClass));
      recentIconsContainer.appendChild(iconElement);
    });
  }

  // Load custom icons from localStorage
  function loadCustomIcons() {
    try {
      const savedIcons = localStorage.getItem("customIcons");
      if (savedIcons) {
        customIcons = JSON.parse(savedIcons);
      }
    } catch (error) {
      console.error("Error loading custom icons:", error);
      customIcons = [];
    }
  }

  // Save custom icons to localStorage
  function saveCustomIcons() {
    try {
      localStorage.setItem("customIcons", JSON.stringify(customIcons));
    } catch (error) {
      console.error("Error saving custom icons:", error);
    }
  }

  // Add custom icon from file upload
  function addCustomIconFromFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showErrorMessage("Please select a valid image file");
      return;
    }

    const reader = new FileReader();

    reader.onerror = function () {
      showErrorMessage("Error reading the file");
    };

    reader.onload = function (e) {
      const iconSrc = e.target.result;

      // Check if we're replacing an existing icon
      const selectedIconField = document.querySelector(".icon-field.active");
      if (selectedIconField) {
        // Get current icon
        const currentIcon = selectedIconField
          .querySelector(".icon-preview")
          .getAttribute("data-icon");

        // If this is a custom icon, remove it from the array
        const customIconIndex = customIcons.findIndex(
          (icon) => icon.src === currentIcon
        );
        if (customIconIndex !== -1) {
          customIcons.splice(customIconIndex, 1);
        }
      }

      // Add new icon
      customIcons.unshift({ src: iconSrc, type: "custom-file" });

      // Limit to 20 custom icons
      if (customIcons.length > 20) {
        customIcons.pop();
      }

      saveCustomIcons();
      renderCustomIcons();

      // If an icon field is active, select this icon
      if (selectedIconField) {
        selectCustomIcon(iconSrc);
        closeIconSelector();
      }
    };

    // Read the file as data URL
    reader.readAsDataURL(file);
  }

  // Add custom icon from URL
  function addCustomIconFromUrl(url) {
    if (!url || !url.trim()) {
      showErrorMessage("Please enter a valid URL");
      return;
    }

    // Test if the URL is a valid image by creating a temporary image element
    const tempImg = new Image();

    // Handle errors for invalid image URLs
    tempImg.onerror = function () {
      showErrorMessage("The URL does not contain a valid image");
    };

    // Handle successful image loading
    tempImg.onload = function () {
      // Check if we're replacing an existing icon
      const selectedIconField = document.querySelector(".icon-field.active");
      if (selectedIconField) {
        // Get current icon
        const currentIcon = selectedIconField
          .querySelector(".icon-preview")
          .getAttribute("data-icon");

        // If this is a custom icon, remove it from the array
        const customIconIndex = customIcons.findIndex(
          (icon) => icon.src === currentIcon
        );
        if (customIconIndex !== -1) {
          customIcons.splice(customIconIndex, 1);
        }
      }

      // Add new icon
      customIcons.unshift({ src: url, type: "custom-url" });

      // Limit to 20 custom icons
      if (customIcons.length > 20) {
        customIcons.pop();
      }

      saveCustomIcons();
      renderCustomIcons();

      // If an icon field is active, select this icon
      if (selectedIconField) {
        selectCustomIcon(url);
        closeIconSelector();
      }

      // Clear the URL input
      const customIconUrl = document.getElementById("customIconUrl");
      if (customIconUrl) {
        customIconUrl.value = "";
      }
    };

    // Set the crossOrigin attribute to allow loading cross-origin images
    tempImg.crossOrigin = "anonymous";

    // Start loading the image
    tempImg.src = url;
  }

  // Show error message in the custom tab
  function showErrorMessage(message) {
    const errorElement = document.getElementById("custom-icon-error");
    errorElement.textContent = message;
    errorElement.style.display = "block";

    // Hide error after 3 seconds
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 3000);
  }

  // Select custom icon
  function selectCustomIcon(iconSrc) {
    const selectedIconField = document.querySelector(".icon-field.active");
    if (selectedIconField) {
      const hiddenInput = selectedIconField.querySelector(
        'input[type="hidden"]'
      );
      const previewElem = selectedIconField.querySelector(".icon-preview");

      hiddenInput.value = iconSrc;

      // Clear any existing font awesome icons
      previewElem.className = "icon-preview";
      previewElem.innerHTML = "";

      // Show the image
      previewElem.style.backgroundImage = `url('${iconSrc}')`;
      previewElem.setAttribute("data-icon", iconSrc);
      previewElem.setAttribute("data-icon-type", "custom");
    }
  }

  // Event Handlers
  function openIconSelector(input, preview) {
    hiddenInputField = input;
    targetPreview = preview;
    modal.classList.add("active");
    searchInput.focus();
    renderIcons();
    renderRecentIcons();
    loadCustomIcons();
    renderCustomIcons();
  }

  function closeIconSelector() {
    modal.classList.remove("active");
    searchInput.value = "";
    currentSearch = "";
    currentCategory = "all";
    updateCategoryView();
  }

  function selectIcon(iconClass) {
    if (hiddenInputField) {
      hiddenInputField.value = iconClass;

      // Update preview if available
      if (targetPreview) {
        targetPreview.className = iconClass;
        targetPreview.innerHTML = "";
        // Remove custom-icon-preview class if present
        targetPreview.classList.remove("custom-icon-preview");
      }

      // Save to recent icons
      saveRecentIcon(iconClass);

      // Trigger change event on input
      const event = new Event("change", { bubbles: true });
      hiddenInputField.dispatchEvent(event);
    }
    closeIconSelector();
  }

  function handleSearch() {
    currentSearch = searchInput.value.toLowerCase().trim();
    renderIcons();

    // Toggle clear button visibility
    if (currentSearch) {
      clearSearchButton.style.display = "block";
    } else {
      clearSearchButton.style.display = "none";
    }
  }

  function clearSearch() {
    searchInput.value = "";
    currentSearch = "";
    clearSearchButton.style.display = "none";
    renderIcons();
    searchInput.focus();
  }

  function changeCategory(e) {
    const category = e.target.dataset.category;
    if (category) {
      currentCategory = category;

      // Update active tab
      categoryTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.category === category);
      });

      updateCategoryView();
    }
  }

  function updateCategoryView() {
    // Show/hide custom icons section based on category
    if (currentCategory === "custom") {
      customIconsSection.style.display = "block";
      iconGrid.style.display = "none";
    } else {
      customIconsSection.style.display = "none";
      iconGrid.style.display = "grid";
      renderIcons();
    }
  }

  // Render functions
  function renderIcons() {
    // Clear existing icons
    iconGrid.innerHTML = "";

    // Get icons to display based on category and search
    let iconsToDisplay = [];

    if (currentCategory === "all") {
      // Combine all categories for 'all' tab but keep type info
      iconsToDisplay = [
        ...iconData.solid.map((icon) => ({ ...icon, type: "solid" })),
        ...iconData.regular.map((icon) => ({ ...icon, type: "regular" })),
        ...iconData.brands.map((icon) => ({ ...icon, type: "brands" })),
      ];
    } else {
      // Just use the selected category
      iconsToDisplay = iconData[currentCategory].map((icon) => ({
        ...icon,
        type: currentCategory,
      }));
    }

    // Apply search filter if needed
    if (currentSearch) {
      iconsToDisplay = iconsToDisplay.filter((icon) =>
        icon.name.toLowerCase().includes(currentSearch)
      );
    }

    // Display a message if no icons found
    if (iconsToDisplay.length === 0) {
      iconGrid.innerHTML = `
        <div class="no-icons-found">
          <i class="fas fa-search"></i>
          <p>No icons found matching "${currentSearch}"</p>
        </div>
      `;
      return;
    }

    // Render the icons
    iconsToDisplay.forEach((icon) => {
      const prefix =
        icon.type === "brands"
          ? "fab"
          : icon.type === "regular"
          ? "far"
          : "fas";
      const iconClass = `${prefix} fa-${icon.name}`;

      const iconElement = document.createElement("div");
      iconElement.className = "icon-item";
      iconElement.innerHTML = `
        <div class="icon-display">
          <i class="${iconClass}"></i>
        </div>
        <div class="icon-name">${icon.name}</div>
      `;

      iconElement.addEventListener("click", () => selectIcon(iconClass));
      iconGrid.appendChild(iconElement);
    });
  }

  // Render custom icons grid
  function renderCustomIcons() {
    const customIconsGrid = document.getElementById("customIconsGrid");

    if (!customIconsGrid) return;

    if (!customIcons || customIcons.length === 0) {
      customIconsGrid.innerHTML = `
        <div class="no-custom-icons">
          <i class="fas fa-info-circle"></i>
          <p>No custom icons added yet. Upload or add URL above.</p>
        </div>
      `;
      return;
    }

    customIconsGrid.innerHTML = "";

    customIcons.forEach((icon) => {
      const iconElement = document.createElement("div");
      iconElement.className = "icon-item custom-icon-item";
      iconElement.innerHTML = `
        <div class="icon-display custom-icon-display">
          <img src="${icon.src}" alt="Custom icon" class="custom-icon-img">
        </div>
        <div class="icon-actions">
          <button class="icon-action icon-action-select" title="Select">
            <i class="fas fa-check"></i>
          </button>
          <button class="icon-action icon-action-delete" title="Delete">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;

      // Select icon
      iconElement
        .querySelector(".icon-action-select")
        .addEventListener("click", () => {
          selectCustomIcon(icon.src);
          closeIconSelector();
        });

      // Delete icon
      iconElement
        .querySelector(".icon-action-delete")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          const index = customIcons.findIndex((i) => i.src === icon.src);
          if (index !== -1) {
            customIcons.splice(index, 1);
            saveCustomIcons();
            renderCustomIcons();
          }
        });

      customIconsGrid.appendChild(iconElement);
    });
  }

  // Initialize
  // Custom icons file upload
  if (customIconUpload) {
    customIconUpload.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        addCustomIconFromFile(this.files[0]);
        // Reset input to allow selecting the same file again
        this.value = "";
      }
    });
  }

  // Custom icons URL add
  if (addCustomIconUrl) {
    addCustomIconUrl.addEventListener("click", function () {
      const customIconUrl = document.getElementById("customIconUrl");
      if (customIconUrl) {
        addCustomIconFromUrl(customIconUrl.value.trim());
      }
    });
  }

  // Add URL on Enter key
  if (customIconUrl) {
    customIconUrl.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const addCustomIconUrlBtn = document.getElementById("addCustomIconUrl");
        if (addCustomIconUrlBtn) {
          addCustomIconUrlBtn.click();
        }
      }
    });
  }

  // Attach event listeners
  closeButton.addEventListener("click", closeIconSelector);
  searchInput.addEventListener("input", handleSearch);
  clearSearchButton.addEventListener("click", clearSearch);

  // Event delegation for category tabs
  document
    .querySelector(".icon-category-tabs")
    .addEventListener("click", changeCategory);

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeIconSelector();
    }
  });

  // Initialize clear button state
  clearSearchButton.style.display = "none";

  // Load custom icons on init
  loadCustomIcons();

  // Public API
  window.IconSelector = {
    open: openIconSelector,
  };
});
