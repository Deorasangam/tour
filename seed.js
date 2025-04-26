const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/User");
const Section = require("./models/Section");

// Load environment variables
dotenv.config();

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/luxtripperdatabase"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define sections based on our website
const sections = [
  {
    name: "navbar",
    displayName: "Header & Navigation",
    icon: "fas fa-bars",
    order: 1,
    content: {
      logo: {
        text: "LUXTRIPPER",
        accentText: "LUX",
        url: "#",
      },
      contactPhone: {
        number: "0203 023 7776",
        icon: "fas fa-phone-alt",
      },
      ctaButton: {
        text: "Plan Your Trip",
        url: "#",
      },
      menuItems: [
        {
          text: "Holidays",
          url: "#",
          order: 1,
        },
        {
          text: "Tours",
          url: "#",
          order: 2,
        },
        {
          text: "Exclusive Deals",
          url: "#",
          order: 3,
        },
        {
          text: "About Us",
          url: "#",
          order: 4,
        },
      ],
    },
  },
  {
    name: "hero",
    displayName: "Hero Section",
    icon: "fas fa-image",
    order: 2,
    isActive: true,
    content: {
      title: "The Burj Khalifa",
      subtitle: "The World's Tallest Tower",
      location: "Dubai, UAE",
      keyPoints: [
        {
          title: "Opened",
          icon: "far fa-calendar-alt",
          detail: "January 4, 2010",
          size: "minor",
        },
        {
          title: "Floors",
          icon: "fas fa-building",
          detail: "163 floors",
          size: "minor",
        },
        {
          title: "Height",
          icon: "fas fa-arrows-alt-v",
          detail: "828 m, 2,717 ft",
          size: "minor",
        },
        {
          title: "Owner",
          icon: "fas fa-user-tie",
          detail: "Emaar Properties",
          size: "minor",
        },
        {
          title: "Cost of build",
          icon: "fas fa-dollar-sign",
          detail: "$1.5 billion",
          size: "minor",
        },
        {
          title: "Elevators",
          icon: "fas fa-elevator",
          detail: "57 elevators",
          size: "minor",
        },
        {
          title: "Address",
          icon: "fas fa-map-marked-alt",
          detail:
            "Sheikh Mohammed bin Rashid Boulevard, Downtown Dubai, United Arab Emirates",
          size: "major",
        },
      ],
    },
  },
  {
    name: "about",
    displayName: "About Section",
    icon: "fas fa-info-circle",
    order: 3,
    isActive: true,
    content: {
      title: "About Burj Khalifa",
      description:
        "The Burj Khalifa, located in Dubai, United Arab Emirates, is the tallest man-made structure in the world, standing at 828 meters (2,717 feet). Completed in 2010, it was designed by the Chicago-based architecture firm Skidmore, Owings & Merrill, with Adrian Smith as the lead architect...",
    },
  },
  {
    name: "history",
    displayName: "History & Construction",
    icon: "fas fa-history",
    order: 4,
    isActive: true,
    content: {
      title: "History & Construction",
      description:
        "The Burj Khalifa, an iconic symbol of Dubai's ambition, is a testament to modern engineering and architectural prowess. Construction began in 2004, driven by Dubai's vision to diversify its economy through tourism and service industries...",
      image: "/images/images7.jpg",
    },
  },
  {
    name: "architecture",
    displayName: "Architecture and Design",
    icon: "fas fa-drafting-compass",
    order: 5,
    isActive: true,
    content: {
      title: "Architecture and Design",
      description:
        "The Burj Khalifa's architecture and design are a fusion of Islamic influences and cutting-edge engineering. Its tri-lobed footprint, inspired by the desert flower Hymenocallis, enhances structural stability and reduces wind resistance...",
      image: "/images/images6.jpg",
      archCards: [
        {
          label: "Architect",
          icon: "fas fa-user",
          content: "Adrian Smith",
          secondary: "(Skidmore, Owings & Merrill - SOM)",
          isFullWidth: false,
        },
        {
          label: "Design Inspiration",
          icon: "fas fa-lightbulb",
          content:
            "Inspired by the Hymenocallis flower and Islamic architecture (geometric patterns).",
          isFullWidth: false,
        },
        {
          label: "Floors",
          icon: "fas fa-building",
          content:
            "163 habitable floors, including residential, commercial, and hotel spaces.",
          isFullWidth: false,
        },
        {
          label: "Shape",
          icon: "fas fa-draw-polygon",
          content:
            "Y-shaped floor plan to maximize views and reduce wind forces.",
          isFullWidth: false,
        },
        {
          label: "Elevators",
          icon: "fas fa-elevator",
          content:
            "57 elevators and 8 escalators; double-decker elevators for efficiency.",
          isFullWidth: true,
        },
      ],
    },
  },
  {
    name: "travel",
    displayName: "Travel Information",
    icon: "fas fa-plane",
    order: 6,
    isActive: true,
    content: {
      title: "How to get there from UK",
      description:
        "The fastest and most convenient way to reach Burj Khalifa from the UK is by taking a direct flight to Dubai International Airport (DXB). Major airlines like Emirates, British Airways, and Etihad operate frequent flights from London, Manchester, and other UK cities...",
    },
  },
  {
    name: "opening-hours",
    displayName: "Opening Hours",
    icon: "far fa-clock",
    order: 7,
    isActive: true,
    content: {
      title: "Burj Khalifa Opening hours",
      description:
        "When planning a visit to the Burj Khalifa, the world's tallest tower, it's important to know the opening hours to make the most of your experience...",
    },
  },
  {
    name: "observation-decks",
    displayName: "Observation Decks",
    icon: "fas fa-eye",
    order: 8,
    isActive: true,
    content: {
      title: "Observation decks and their timings",
      decks: [
        {
          title: "At the Top",
          floors: "124th and 125th floor",
          openingWeekdays: "10:00 AM",
          openingWeekends: "08:00 AM",
          closing: "Till Midnight",
          image: "/images/imaes3.jpg",
        },
        {
          title: "At the Top Sky",
          floors: "124th, 125th, and 148th floor",
          openingWeekdays: "10:00 AM",
          openingWeekends: "08:00 AM",
          closing: "Till Midnight",
          image: "https://images.unsplash.com/photo-1613476798408-94b5323ca3a5",
        },
      ],
    },
  },
  {
    name: "best-time",
    displayName: "Best Time to Visit",
    icon: "far fa-clock",
    order: 9,
    isActive: true,
    content: {
      title: "Best time to visit Burj Khalifa",
      description:
        "When selecting your time slot, you will either choose a prime time visit or a non-prime time visit. Entry during prime hours cost slightly more because these tickets correspond with Dubai's sunset timings...",
    },
  },
  {
    name: "best-ways",
    displayName: "Best Ways to Experience",
    icon: "fas fa-star-of-life",
    order: 10,
    isActive: true,
    content: {
      title: "Best Ways to Experience Burj Khalifa",
    },
  },
  {
    name: "tickets",
    displayName: "Tickets",
    icon: "fas fa-ticket-alt",
    order: 11,
    isActive: true,
    content: {
      title: "Burj Khalifa Tickets",
    },
  },
  {
    name: "tours",
    displayName: "Tours",
    icon: "fas fa-map-marker-alt",
    order: 12,
    isActive: true,
    content: {
      title: "Burj Khalifa Tours",
      description:
        "Burj Khalifa tours offer the chance to ascend the world's tallest building, providing breathtaking panoramic views of Dubai's skyline. Visitors can access observation decks on various levels, experiencing the city from an unparalleled perspective.",
    },
  },
  {
    name: "hotels",
    displayName: "Hotels",
    icon: "fas fa-hotel",
    order: 13,
    isActive: true,
    content: {
      title: "Burj Khalifa Hotel to Stay",
    },
  },
  {
    name: "photos",
    displayName: "Photos Gallery",
    icon: "fas fa-camera",
    order: 14,
    isActive: true,
    content: {
      title: "Burj Khalifa Photos",
    },
  },
  {
    name: "faq",
    displayName: "FAQ",
    icon: "far fa-question-circle",
    order: 15,
    isActive: true,
    content: {
      title: "FAQ's",
    },
  },
  {
    name: "facts",
    displayName: "Facts & Records",
    icon: "fas fa-list-alt",
    order: 16,
    isActive: true,
    content: {
      title: "Burj Khalifa Facts & Records",
    },
  },
  {
    name: "nearby",
    displayName: "Nearby Attractions",
    icon: "fas fa-monument",
    order: 17,
    isActive: true,
    content: {
      title: "Burj Khalifa Nearby Attractions",
    },
  },
  {
    name: "beyond",
    displayName: "Beyond Burj Khalifa",
    icon: "fas fa-globe-americas",
    order: 18,
    isActive: true,
    content: {
      title: "Beyond Burj Khalifa",
    },
  },
  {
    name: "whatsapp",
    displayName: "WhatsApp Subscription",
    icon: "fab fa-whatsapp",
    order: 19,
    isActive: true,
    content: {
      title: "Subscribe to our WhatsApp",
      subtitle: "First access to our exclusive travel deals & offers",
    },
  },
  {
    name: "newsletter",
    displayName: "Newsletter Subscription",
    icon: "far fa-envelope",
    order: 20,
    isActive: true,
    content: {
      title:
        "Subscribe to our newsletter to get the best offers direct to your inbox",
    },
  },
  {
    name: "footer",
    displayName: "Footer",
    icon: "fas fa-copyright",
    order: 21,
    isActive: true,
    content: {
      title: "Footer Section",
    },
  },
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear the database
    await User.deleteMany({});
    await Section.deleteMany({});

    console.log("Database cleared");

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      lastLogin: null,
    });

    const savedUser = await adminUser.save();
    console.log("Admin user created:", savedUser.email);

    // Add user reference to sections
    const sectionsWithUser = sections.map((section) => ({
      ...section,
      updatedBy: savedUser._id,
    }));

    // Create sections
    await Section.insertMany(sectionsWithUser);
    console.log("Sections created:", sections.length);

    console.log("Database seeded successfully");

    // Close database connection
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
