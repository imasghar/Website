// Glassmorphism Interactive Custom Animations Suite using GSAP & ScrollTrigger

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lenis Smooth Scroll (Inertia Scrolling)
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      lerp: 0.08,             // 0.08 for extremely smooth and premium deceleration
      wheelMultiplier: 1.0,   // Natural scroll speed
      gestureOrientation: "vertical",
      smoothTouch: false,     // Keep native touch behavior on mobile devices for accessibility
    });

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      // Sync Lenis with GSAP ScrollTrigger to prevent any jittering
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback animation frame loop if GSAP is missing
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Expose lenis instance globally for other scripts
    window.lenis = lenis;
  } else {
    console.warn("Lenis smooth scroll is not loaded. Inertia scrolling disabled.");
  }

  // 2. Register GSAP Plugins
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initializeAnimations();
  } else {
    console.warn("GSAP or ScrollTrigger CDNs are not loaded. Animations disabled.");
    // Fallback: instantly reveal everything and set numerical stats to target values
    document.querySelectorAll(".gsap-reveal").forEach(el => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".stat-number").forEach(stat => {
      const targetVal = stat.getAttribute("data-target-value");
      if (targetVal !== null) {
        stat.textContent = targetVal;
      }
    });
  }

  // 3. Interactive Card Cursor-Glow Trail
  initializeCardGlows();

  // 4. Dynamic Navbar Link Highlighter
  highlightActiveNavLinks();

  // 5. Interactive Homepage Tabs Showcase
  initializeHomepageTabs();

  // 6. Interactive Services Stepper (Services Page)
  initializeServicesStepper();

  // Refresh ScrollTrigger on window load to ensure correct positions after all assets (images, fonts, custom logos) are loaded
  window.addEventListener("load", () => {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
});

// Cursor-Glow effect
function initializeCardGlows() {
  const cards = document.querySelectorAll(".card-hover-lift, .contact-highlight, .card");
  
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

// Active Page Navbar Highlighting
function highlightActiveNavLinks() {
  let currentPath = window.location.pathname.split("/").pop();
  
  // Clean query strings or hash parameters if present
  if (currentPath) {
    currentPath = currentPath.split("?")[0].split("#")[0];
  }
  
  // If we are at the root path, empty string, folder root, or directory without .html
  if (!currentPath || !currentPath.includes(".") || currentPath.toLowerCase() === "website") {
    currentPath = "index.html";
  }
  
  document.querySelectorAll(".navbar-nav .nav-link, .navbar-nav .dropdown-item").forEach(link => {
    const href = link.getAttribute("href");
    if (href) {
      let linkPath = href.split("/").pop();
      if (linkPath) {
        linkPath = linkPath.split("?")[0].split("#")[0];
      }
      
      if (linkPath === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
        
        // Activate parent dropdown link if nested
        const parentDropdown = link.closest(".dropdown");
        if (parentDropdown) {
          const dropdownToggle = parentDropdown.querySelector(".dropdown-toggle");
          if (dropdownToggle) {
            dropdownToggle.classList.add("active");
          }
        }
      }
    }
  });

  // Specifically highlight Contact active state
  const contactBtn = document.getElementById("nav-link-contact-btn");
  if (contactBtn) {
    let contactHref = contactBtn.getAttribute("href").split("/").pop();
    if (contactHref) {
      contactHref = contactHref.split("?")[0].split("#")[0];
    }
    if (contactHref === currentPath) {
      contactBtn.classList.add("active");
    }
  }
}

// GSAP Animations Engine
function initializeAnimations() {
  // Disable GSAP ScrollTrigger animations on small mobile screens to optimize performance
  if (window.innerWidth < 768) {
    // Just reveal everything instantly on mobile to avoid layout locks
    gsap.set(".gsap-reveal", { opacity: 1, y: 0 });
    
    // Instantly set numerical stats to their target values on mobile
    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach(stat => {
      const targetVal = stat.getAttribute("data-target-value");
      if (targetVal !== null) {
        stat.textContent = targetVal;
      }
    });
    return;
  }

  // --- A. Text Reveal Animation ---
  const textSplitElements = document.querySelectorAll(".hero-parallax-section h1, .services-hero h1, .py-5 h2:not(.accordion-header button)");
  textSplitElements.forEach(el => {
    const originalText = el.innerText.trim();
    if (originalText.length > 0) {
      // Split text into words wrapped in overflow-hidden containers for clean slide reveals
      const words = originalText.split(" ");
      el.innerHTML = words.map(word => {
        // preserve coloring styles if present
        if (word.includes("Avanta")) {
          return `<span style="display:inline-block; overflow:hidden;"><span style="display:inline-block; color:rgb(106, 79, 226);" class="gsap-text-word">Avanta</span></span>`;
        }
        return `<span style="display:inline-block; overflow:hidden;"><span style="display:inline-block;" class="gsap-text-word">${word}</span></span>`;
      }).join(" ");
      
      gsap.from(el.querySelectorAll(".gsap-text-word"), {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    }
  });

  // --- B. Hero Parallax Background Shapes ---
  if (document.querySelector(".hero-parallax")) {
    gsap.to(".shape-one", {
      yPercent: 40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-parallax-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".shape-two", {
      yPercent: -40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-parallax-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".shape-three", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-parallax-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Parallax hero image & texts
    gsap.to(".parallax-image", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-parallax-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // --- C. Scroll-Reveal: Cards & Grids ---
  const cardGrids = [
    ".row-cols-lg-3 .col", 
    ".row-cols-lg-4 .col",
    "#features .col"
  ];

  // Prevent duplicate GSAP scroll reveal bindings on overlapping selectors
  const animatedElements = new Set();

  cardGrids.forEach(selector => {
    const elements = Array.from(document.querySelectorAll(selector)).filter(el => !animatedElements.has(el));
    
    if (elements.length > 0) {
      // Mark elements as animated
      elements.forEach(el => animatedElements.add(el));

      gsap.from(elements, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: elements[0].closest(".row") || elements[0].parentElement,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    }
  });

  // --- D. Scroll-Reveal: Alternating Timeline Nodes ---
  const timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach((item, index) => {
    const isEven = index % 2 === 0;
    gsap.from(item, {
      x: isEven ? -100 : 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  });

  // --- E. Scroll-Reveal: Industry Feature Block Sections ---
  const solutionRows = document.querySelectorAll("#features-images .row.gy-3");
  solutionRows.forEach((row, index) => {
    const isEven = index % 2 === 0;
    const imgCol = row.querySelector(".col-12.col-md-6");
    const txtCol = row.querySelector(".col.d-flex");
    
    if (imgCol && txtCol) {
      gsap.from(imgCol, {
        x: isEven ? -70 : 70,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      gsap.from(txtCol, {
        x: isEven ? 70 : -70,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: row,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    }
  });

  // --- F. Success Page Checkmark Animation ---
  if (document.querySelector(".success-checkmark-svg")) {
    const tl = gsap.timeline();
    tl.from(".success-checkmark-circle", {
      scale: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .fromTo(".checkmark-circle-path", 
      { strokeDashoffset: 166 }, 
      { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(".checkmark-check-path", 
      { strokeDashoffset: 48 }, 
      { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" },
      "-=0.1"
    );
  }

  // --- G. Simple Accordion Fade Reveals ---
  const accordionItems = document.querySelectorAll(".accordion-item");
  if (accordionItems.length > 0) {
    gsap.from(accordionItems, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".accordion",
        start: "top 85%"
      }
    });
  }

  // --- H. Section Image Parallax Depth Effects ---
  const parallaxImages = document.querySelectorAll(".industry-solution-img, .startup-phase-img, #story img, .py-5 img:not(.navbar-brand img, footer img, .success-checkmark-svg, .parallax-mockup-img)");
  
  parallaxImages.forEach(img => {
    const parent = img.parentElement;
    if (parent) {
      parent.style.overflow = "hidden";
      parent.style.position = "relative";
      
      gsap.fromTo(img, 
        { yPercent: -15, scale: 1.08 },
        {
          yPercent: 15,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: parent,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    }
  });

  // --- I. Text Parallax Sub-Shifts (Creates physical reading depth) ---
  const parallaxTexts = document.querySelectorAll(".display-4 + p, .display-5 + p, .timeline-item p, #features-images p");
  parallaxTexts.forEach(txt => {
    gsap.fromTo(txt, 
      { y: 15 },
      {
        y: -15,
        ease: "power1.out",
        scrollTrigger: {
          trigger: txt.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5
        }
      }
    );
  });

  // --- J. Numerical Stat Count-Up Animation (About Us page) ---
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length > 0) {
    statNumbers.forEach(stat => {
      const targetVal = parseInt(stat.getAttribute("data-target-value"), 10) || 0;
      
      // Initialize textContent to 0
      stat.textContent = "0";
      
      // Tween a dummy object to ensure robust number updating across all GSAP environments
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
          stat.textContent = Math.round(obj.val);
        },
        scrollTrigger: {
          trigger: stat.closest(".stats-grid") || stat,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  }

  // --- K. Contact Page Entrance Animation ---
  const contactBanner = document.querySelector(".contact-banner");
  if (contactBanner) {
    const contactFormCol = document.querySelector(".contact-highlight:not(.contact-info-card)");
    const verticalCards = document.querySelectorAll(".col-lg-5[data-aos='fade-left'] .contact-info-card");
    const rightSideText = document.querySelectorAll(".col-lg-5[data-aos='fade-left'] h2, .col-lg-5[data-aos='fade-left'] p:not(.mb-0)");
    const socialRow = document.querySelector(".contact-social-row");
    
    const contactTL = gsap.timeline({
      defaults: { ease: "power3.out" }
    });
    
    contactTL.from(".contact-banner .glassy-lightning-badge", {
      y: -30,
      opacity: 0,
      duration: 0.8
    })
    .from(".contact-banner h1", {
      y: 30,
      opacity: 0,
      duration: 0.8
    }, "-=0.6")
    .from(".contact-banner p.lead", {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, "-=0.6")
    .from(".contact-banner-img", {
      x: 50,
      scale: 0.95,
      opacity: 0,
      duration: 1
    }, "-=0.8");
    
    if (contactFormCol) {
      contactTL.from(contactFormCol, {
        x: -50,
        opacity: 0,
        duration: 1
      }, "-=0.8");
    }
    
    if (rightSideText.length > 0) {
      contactTL.from(rightSideText, {
        x: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1
      }, "-=0.8");
    }
    
    if (verticalCards.length > 0) {
      contactTL.from(verticalCards, {
        x: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12
      }, "-=0.6");
    }
    
    if (socialRow) {
      contactTL.from(socialRow.querySelectorAll(".contact-social-btn"), {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08
      }, "-=0.4");
    }

    // Full-Width Google Map ScrollTrigger
    const fullMap = document.querySelector(".contact-map-wrapper.full-width-map");
    if (fullMap) {
      gsap.from(fullMap, {
        opacity: 0,
        y: 40,
        duration: 1,
        scrollTrigger: {
          trigger: ".contact-full-map-section",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    }

    // Horizontal Info Cards ScrollTrigger
    const horizontalCards = document.querySelectorAll(".contact-horizontal-row .contact-info-card");
    if (horizontalCards.length > 0) {
      gsap.from(horizontalCards, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".contact-horizontal-row",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    }
  }

  // --- L. Master Technologies Horizontal Scroll Parallax ---
  const techLogos = document.querySelector(".tech-logos");
  if (techLogos) {
    gsap.fromTo(techLogos, 
      { x: "12%" }, 
      {
        x: "-12%",
        ease: "none",
        scrollTrigger: {
          trigger: techLogos.closest("section"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2
        }
      }
    );
  }

  // --- M. Alternating Services Blocks ScrollTrigger Parallax ---
  const serviceBlocks = document.querySelectorAll(".service-block-row");
  if (serviceBlocks.length > 0) {
    serviceBlocks.forEach(row => {
      const isReversed = row.classList.contains("flex-lg-row-reverse");
      const textCol = row.querySelector(".service-text-col");
      const imgCol = row.querySelector(".service-image-col");
      
      if (textCol && imgCol) {
        // Slide in staggered columns
        gsap.from(textCol, {
          x: isReversed ? 60 : -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 82%",
            toggleActions: "play none none none"
          }
        });
        
        gsap.from(imgCol, {
          x: isReversed ? -60 : 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 82%",
            toggleActions: "play none none none"
          }
        });
        
        // Mockup frame parallax depth shift
        const img = imgCol.querySelector(".parallax-mockup-img");
        if (img) {
          gsap.fromTo(img, 
            { yPercent: -8, scale: 1.04 },
            {
              yPercent: 8,
              scale: 1.04,
              ease: "none",
              scrollTrigger: {
                trigger: imgCol,
                start: "top bottom",
                end: "bottom top",
                scrub: true
              }
            }
          );
        }
      }
    });
  }

  // --- N. Humanix-Style Hero Scroll Pin & Overlap ---
  const heroSection = document.querySelector(".hero-parallax-section");
  const overlapContent = document.querySelector(".main-content-overlap");
  const curtain = document.querySelector(".hero-overlay-curtain");
  
  if (heroSection && overlapContent) {
    const mm = gsap.matchMedia();
    
    // Desktop and Tablet pinning effects
    mm.add("(min-width: 768px)", () => {
      document.body.classList.add("home-page-stacked");

      // Pin the hero container
      ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        id: "hero-pin"
      });

      // Fade overlay curtain as we scroll down
      if (curtain) {
        gsap.to(curtain, {
          opacity: 0.82,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Parallax shift & fade hero content container
      const heroContainer = heroSection.querySelector(".container");
      if (heroContainer) {
        gsap.to(heroContainer, {
          yPercent: 18,
          scale: 0.96,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }
    });
  }

  // --- P. Horizontal Wavy Roadmap Pin & Scroll ---
  const roadmapSection = document.querySelector("#roadmap-section");
  const roadmapTrack = document.querySelector(".roadmap-track");
  const laserPath = document.querySelector(".laser-path");
  
  if (roadmapSection && roadmapTrack) {
    const mm = gsap.matchMedia();
    
    // Only run on desktop/tablet screens where horizontal wavy scroll fits
    mm.add("(min-width: 992px)", () => {
      // 1. Calculate moveAmount exactly as requested
      const moveAmount = 3000 - (window.innerWidth / 2) + 200;
      
      // 2. Initialize SVG path drawing (start pre-drawn up to Phase 1 at 600px)
      if (laserPath) {
        const pathLength = laserPath.getTotalLength();
        gsap.set(laserPath, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength - 600
        });
      }

      // 3. Set initial states of nodes and cards (Phase 1 active, others hidden)
      const phaseNodes = document.querySelectorAll(".phase-node");
      const glassCards = [".glass-card-1", ".glass-card-2", ".glass-card-3", ".glass-card-4"];
      
      // Set track starting position to center Phase 1 (at left: 600px) in the viewport
      const startX = (window.innerWidth / 2) - 600;
      gsap.set(roadmapTrack, { x: startX });

      gsap.set(phaseNodes[0], { scale: 1, opacity: 1 });
      const firstCard = document.querySelector(glassCards[0]);
      if (firstCard) {
        gsap.set(firstCard, { opacity: 1, y: 0, xPercent: -50 });
      }

      for (let i = 1; i < phaseNodes.length; i++) {
        gsap.set(phaseNodes[i], { scale: 0, opacity: 0 });
        const card = document.querySelector(glassCards[i]);
        if (card) {
          gsap.set(card, {
            opacity: 0,
            y: i % 2 === 0 ? 50 : -50,
            xPercent: -50
          });
        }
      }

      // 4. Create ScrollTrigger timeline
      const roadmapTL = gsap.timeline({
        scrollTrigger: {
          trigger: roadmapSection,
          pin: true,
          start: "top top",
          end: "+=4000", // exact requirement
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      // Horizontal track move (starts at startX and moves to -moveAmount)
      roadmapTL.fromTo(roadmapTrack, 
        { x: startX },
        { x: -moveAmount, ease: "none", duration: 1.0 }, 
        0
      );

      // Path tracing (draws laser from 600px to 3800px)
      if (laserPath) {
        roadmapTL.to(laserPath, {
          strokeDashoffset: 0,
          ease: "none",
          duration: 1.0
        }, 0);
      }
      
      // Stagger phase cards entry as they come into view (for phases 2, 3, 4)
      phaseNodes.forEach((node, idx) => {
        if (idx === 0) return; // Phase 1 is already active

        const nodeX = (idx === 1 ? 1400 : idx === 2 ? 2200 : 3000);
        const revealPoint = nodeX / 3800; // exact point when laser reaches node

        roadmapTL.to(node, {
          scale: 1,
          opacity: 1,
          duration: 0.1,
          ease: "back.out(1.5)"
        }, revealPoint);

        const card = document.querySelector(glassCards[idx]);
        if (card) {
          roadmapTL.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.15,
            ease: "power2.out"
          }, revealPoint + 0.02);
        }
      });

      // Add GSAP-based hover scaling effects for the glass cards
      glassCards.forEach((cardSel) => {
        const card = document.querySelector(cardSel);
        if (card) {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, { scale: 1.03, duration: 0.3, ease: "power2.out" });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" });
          });
        }
      });
    });

    mm.add("(max-width: 991.98px)", () => {
      // Clean up desktop values
      gsap.killTweensOf([roadmapTrack, laserPath].filter(Boolean));
      const phaseNodes = document.querySelectorAll(".phase-node");
      const glassCards = document.querySelectorAll(".glass-card-1, .glass-card-2, .glass-card-3, .glass-card-4");
      gsap.set(roadmapTrack, { clearProps: "all" });
      if (laserPath) gsap.set(laserPath, { clearProps: "all" });
      gsap.set(phaseNodes, { clearProps: "all" });
      gsap.set(glassCards, { clearProps: "all" });
    });
  }

  // --- O. Sequential Unstacking Testimonials ScrollTrigger ---
  const testimonialsSec = document.querySelector("#testimonials");
  const cards = document.querySelectorAll(".testimonial-card");
  const track = document.querySelector(".cards-track");
  const scrollWrapper = document.querySelector(".cards-scroll-wrapper");
  
  if (testimonialsSec && cards.length > 0 && track && scrollWrapper) {
    const gap = 450;      // gap offset when unstacked
    const cardWidth = 420; // card width in pixels
    const padding = 100;   // padding for track edges
    
    // 1. Set track width dynamically for both desktop and JS calculations
    const totalTrackWidth = (cards.length - 1) * gap + cardWidth + padding;
    track.style.width = `${totalTrackWidth}px`;
    
    // 2. Set up interactive hover scaling/lifting via GSAP to prevent transform conflicts
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -10, scale: 1.02, duration: 0.35, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: "power2.out" });
      });
    });
    
    // 3. Desktop Pinning & Unstacking Animation
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      // Set initial rotations and positions (stacked at x: 0)
      const rotations = [-4, 2, -2, 4];
      cards.forEach((card, idx) => {
        gsap.set(card, { 
          x: 0, 
          rotation: rotations[idx % rotations.length] 
        });
      });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: testimonialsSec,
          pin: true,
          start: "top 80px", // Pin below the sticky header navbar
          end: () => "+=" + (cards.length * 600),
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
      
      // Calculate responsive track shifting to keep all cards within the viewport at the end of the scroll
      const totalSpread = (cards.length - 1) * gap;
      const maxTrackX = Math.max(0, totalSpread + cardWidth - (window.innerWidth - 150));
      const trackShiftPerStep = maxTrackX / (cards.length - 1);
      
      // Step 1: Straighten the first card
      tl.to(cards[0], {
        rotation: 0,
        duration: 0.5,
        ease: "power1.inOut"
      });
      
      // Step 2+: Sequentially unstack each subsequent card to the right side
      for (let i = 1; i < cards.length; i++) {
        const stepLabel = `step-${i}`;
        const targetCards = Array.from(cards).slice(i);
        
        // Move the track to the left dynamically to adjust viewport
        tl.to(track, {
          x: -i * trackShiftPerStep,
          duration: 1,
          ease: "power2.inOut"
        }, stepLabel);
        
        // Translate all remaining stacked cards to the right
        tl.to(targetCards, {
          x: i * gap,
          rotation: rotations[i % rotations.length],
          duration: 1,
          ease: "power2.inOut"
        }, stepLabel);

        // Straighten the card that has just been unstacked (cards[i])
        tl.to(cards[i], {
          rotation: 0,
          duration: 0.5,
          ease: "power1.inOut"
        }, `${stepLabel}+=0.5`);
      }
    });
    
    // Reset positions on mobile resize to prevent layout breaking
    mm.add("(max-width: 991.98px)", () => {
      gsap.killTweensOf([track, cards]);
      gsap.set(track, { clearProps: "all" });
      gsap.set(cards, { clearProps: "all" });
    });
  }
}

// 5. Interactive Homepage Tabs Showcase (Auto-Rotating Carousel Behavior)
function initializeHomepageTabs() {
  const tabs = document.querySelectorAll(".showcase_tabs_btns .s_tab_btn");
  const contents = document.querySelectorAll(".s_tab_wrapper .s_tab");
  
  if (tabs.length === 0 || contents.length === 0) return;

  let isTransitioning = false;

  function switchTab(index) {
    if (isTransitioning) return;
    const tab = tabs[index];
    const targetId = tab.getAttribute("data-tab");
    const activeTab = document.querySelector(".s_tab_wrapper .active-tab");
    const targetTab = document.querySelector(targetId);
    
    if (!targetTab || activeTab === targetTab) return;
    
    // Update active classes on buttons
    tabs.forEach(btn => btn.classList.remove("active"));
    tab.classList.add("active");
    
    // Animate transition using GSAP if available, otherwise fallback to simple class swap
    if (typeof gsap !== "undefined") {
      isTransitioning = true;
      gsap.killTweensOf(contents);
      
      gsap.to(activeTab, {
        opacity: 0,
        y: 15,
        duration: 0.25,
        onComplete: () => {
          // Clear active-tab class on all panels to avoid duplicate active tabs
          contents.forEach(c => c.classList.remove("active-tab"));
          
          targetTab.classList.add("active-tab");
          
          // Set initial state for new tab
          gsap.fromTo(targetTab, 
            { opacity: 0, y: 15 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.45, 
              ease: "power2.out",
              onComplete: () => {
                isTransitioning = false;
              }
            }
          );
        }
      });
    } else {
      contents.forEach(c => c.classList.remove("active-tab"));
      targetTab.classList.add("active-tab");
    }
  }

  function startAutoRotation() {
    autoRotateInterval = setInterval(() => {
      // Find current active index
      let activeIndex = 0;
      tabs.forEach((tab, idx) => {
        if (tab.classList.contains("active")) {
          activeIndex = idx;
        }
      });
      
      // Move to next tab (wrap around)
      const nextIndex = (activeIndex + 1) % tabs.length;
      switchTab(nextIndex);
    }, rotationDelay);
  }

  function resetTimer() {
    clearInterval(autoRotateInterval);
    startAutoRotation();
  }
  
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(index);
      resetTimer(); // Reset the 5s timer on manual click to let user read the content
    });
  });

  // Start auto-rotation on page load
  startAutoRotation();
}

// 6. Services Stepper interactive tab controller
function initializeServicesStepper() {
  const stepperBtns = document.querySelectorAll(".services-stepper-row .stepper-btn");
  const panels = document.querySelectorAll(".services-content .stepper-panel");
  
  if (stepperBtns.length === 0 || panels.length === 0) return;
  
  stepperBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const stepNum = btn.getAttribute("data-step");
      const targetPanel = document.getElementById(`panel-step-${stepNum}`);
      const activePanel = document.querySelector(".services-content .active-panel");
      
      if (!targetPanel || activePanel === targetPanel) return;
      
      // Update buttons
      stepperBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Animate active state using GSAP
      if (typeof gsap !== "undefined") {
        gsap.to(activePanel, {
          opacity: 0,
          y: 15,
          duration: 0.25,
          onComplete: () => {
            activePanel.classList.remove("active-panel");
            targetPanel.classList.add("active-panel");
            
            // GSAP slide & fade in for content elements
            gsap.fromTo(targetPanel, 
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
            );
            
            // Sub-animations for mockup image sliding in & features list staggered
            const mockup = targetPanel.querySelector(".device-mockup-wrapper");
            const textHeading = targetPanel.querySelector("h3");
            const listHeaders = targetPanel.querySelectorAll("h5");
            const lists = targetPanel.querySelectorAll("ul");
            
            if (mockup) {
              gsap.fromTo(mockup, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });
            }
            if (textHeading) {
              gsap.fromTo(textHeading, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
            }
            if (listHeaders.length > 0) {
              gsap.fromTo(listHeaders, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 });
            }
            if (lists.length > 0) {
              gsap.fromTo(lists, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
            }
          }
        });
      } else {
        // Fallback if GSAP is not loaded
        activePanel.classList.remove("active-panel");
        targetPanel.classList.add("active-panel");
      }
    });
  });
}

