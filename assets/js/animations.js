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

  // 2. Register GSAP Plugins (incorporating TextPlugin)
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    if (typeof TextPlugin !== "undefined") {
      gsap.registerPlugin(ScrollTrigger, TextPlugin);
    } else {
      gsap.registerPlugin(ScrollTrigger);
    }
    initializeAnimations();
  } else {
    console.warn("GSAP or ScrollTrigger CDNs are not loaded. Animations disabled.");
    // Fallback: instantly reveal everything and set numerical stats to target values
    document.querySelectorAll(".gsap-reveal").forEach(el => {
      el.style.opacity = "1";
      el.style.transform = "none";
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

  // 7. Initialize Global Upgrades (Cursor, transitions, section reveal stagger, etc.)
  initializeGlobalUpgrades();

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
  
  if (currentPath) {
    currentPath = currentPath.split("?")[0].split("#")[0];
  }
  
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
}

// GSAP Animations Engine
function initializeAnimations() {
  // Prevent duplicate GSAP scroll reveal bindings on overlapping selectors
  const animatedElements = new Set();

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Just reveal everything instantly and bypass animations
    gsap.set(".gsap-reveal, .roadmap-track, .laser-path, .phase-node, .glass-card-1, .glass-card-2, .glass-card-3, .glass-card-4, .service-eyebrow, .service-hero-h1, .service-hero-sub, .trust-chip, .hero-cta-group, .code-window-mockup, .phone-frame-mockup, .custom-hero-mockup, .feature-card, .comp-badge, .system-card, .hipaa-section, .dash-bar, .footer-tagline, .footer-col, .social-icon", {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      scaleY: 1,
      scaleX: 1,
      strokeDashoffset: 0
    });
    return;
  }

  // Disable GSAP ScrollTrigger animations on small mobile screens to optimize performance
  if (window.innerWidth < 768) {
    // Just reveal everything instantly on mobile to avoid layout locks
    gsap.set(".gsap-reveal", { opacity: 1, y: 0 });
    return;
  }

  // --- A. Text Reveal Animation (excl. h1 tags for typing animation) ---
  const textSplitElements = document.querySelectorAll(".py-5 h2:not(.accordion-header button)");
  textSplitElements.forEach(el => {
    const originalText = el.innerText.trim();
    if (originalText.length > 0) {
      // Split text into words wrapped in overflow-hidden containers for clean slide reveals
      const words = originalText.split(" ");
      el.innerHTML = words.map(word => {
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
    ".row-cols-lg-4 .col:not(.culture-card-col):not(#benefits-section .col)", // exclude culture and benefits cards (have custom stagger)
    "#features .col"
  ];

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
  const timelineItems = document.querySelectorAll(".timeline-item:not(.careers-timeline-item)");
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
      stat.textContent = "0";
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

  // --- L. Master Technologies Horizontal Scroll Parallax (REMOVED: replaced by CSS marquee) ---
  // commented out to avoid conflict

  // --- M. Alternating Services Blocks ScrollTrigger Parallax ---
  const serviceBlocks = document.querySelectorAll(".service-block-row");
  if (serviceBlocks.length > 0) {
    serviceBlocks.forEach(row => {
      const textCol = row.querySelector(".service-text-col");
      const imgCol = row.querySelector(".service-image-col");
      
      if (textCol && imgCol) {
        gsap.from(textCol, {
          x: -80,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        });
        
        gsap.from(imgCol, {
          x: 80,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        });
        
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
    mm.add("(min-width: 768px)", () => {
      document.body.classList.add("home-page-stacked");
      ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        id: "hero-pin"
      });
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
      
      let pathLength = 0;
      // 2. Initialize SVG path drawing (start pre-drawn up to Phase 1 at 600px)
      if (laserPath) {
        pathLength = laserPath.getTotalLength();
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

      // Set up the wave-rider cursor
      const svgTrack = document.querySelector("#svg-track");
      let waveRider = null;
      if (svgTrack) {
        waveRider = svgTrack.querySelector("#wave-rider");
        if (!waveRider) {
          waveRider = document.createElementNS("http://www.w3.org/2000/svg", "g");
          waveRider.setAttribute("id", "wave-rider");
          
          let defs = svgTrack.querySelector("defs");
          if (defs) {
            let glowFilter = defs.querySelector("#rider-glow");
            if (!glowFilter) {
              glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
              glowFilter.setAttribute("id", "rider-glow");
              glowFilter.setAttribute("x", "-50%");
              glowFilter.setAttribute("y", "-50%");
              glowFilter.setAttribute("width", "200%");
              glowFilter.setAttribute("height", "200%");
              
              const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
              blur.setAttribute("stdDeviation", "4");
              blur.setAttribute("result", "blur");
              
              const merge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
              const mergeNode1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
              mergeNode1.setAttribute("in", "blur");
              const mergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
              mergeNode2.setAttribute("in", "SourceGraphic");
              
              merge.appendChild(mergeNode1);
              merge.appendChild(mergeNode2);
              glowFilter.appendChild(blur);
              glowFilter.appendChild(merge);
              defs.appendChild(glowFilter);
            }
          }
          
          // Pulse Ring
          const pulseRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          pulseRing.setAttribute("class", "rider-pulse-ring");
          pulseRing.setAttribute("r", "16");
          pulseRing.setAttribute("fill", "none");
          pulseRing.setAttribute("stroke", "url(#roadmap-gradient)");
          pulseRing.setAttribute("stroke-width", "2");
          pulseRing.setAttribute("opacity", "0.8");
          
          // Middle glowing core
          const middleCore = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          middleCore.setAttribute("r", "8");
          middleCore.setAttribute("fill", "url(#roadmap-gradient)");
          middleCore.setAttribute("filter", "url(#rider-glow)");
          
          // Inner core
          const innerCore = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          innerCore.setAttribute("r", "4");
          innerCore.setAttribute("fill", "#ffffff");
          
          waveRider.appendChild(pulseRing);
          waveRider.appendChild(middleCore);
          waveRider.appendChild(innerCore);
          svgTrack.appendChild(waveRider);
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
        },
        onUpdate: () => {
          if (laserPath && pathLength > 0 && waveRider) {
            const currentOffset = parseFloat(gsap.getProperty(laserPath, "strokeDashoffset"));
            const currentLength = pathLength - currentOffset;
            
            if (currentLength >= 0 && currentLength <= pathLength) {
              const point = laserPath.getPointAtLength(currentLength);
              waveRider.setAttribute("transform", `translate(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
            }
          }
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

  // --- O. Sequential Unstacking Testimonials ScrollTrigger (Desktop) ---
  const testimonialsSec = document.querySelector("#testimonials");
  const cards = document.querySelectorAll(".testimonial-card");
  const track = document.querySelector(".cards-track");
  const scrollWrapper = document.querySelector(".cards-scroll-wrapper");
  
  if (testimonialsSec && cards.length > 0 && track && scrollWrapper) {
    const gap = 450;
    const cardWidth = 420;
    const padding = 100;
    const totalTrackWidth = (cards.length - 1) * gap + cardWidth + padding;
    track.style.width = `${totalTrackWidth}px`;
    
    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        if (window.innerWidth >= 992) {
          gsap.to(card, { y: -10, scale: 1.02, duration: 0.35, ease: "power2.out" });
        }
      });
      card.addEventListener("mouseleave", () => {
        if (window.innerWidth >= 992) {
          gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: "power2.out" });
        }
      });
    });
    
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      const rotations = [-4, 2, -2, 4];
      cards.forEach((card, idx) => {
        gsap.set(card, { x: 0, rotation: rotations[idx % rotations.length] });
      });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: testimonialsSec,
          pin: true,
          start: "top 80px",
          end: () => "+=" + (cards.length * 600),
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
      const totalSpread = (cards.length - 1) * gap;
      const maxTrackX = Math.max(0, totalSpread + cardWidth - (window.innerWidth - 150));
      const trackShiftPerStep = maxTrackX / (cards.length - 1);
      tl.to(cards[0], { rotation: 0, duration: 0.5, ease: "power1.inOut" });
      for (let i = 1; i < cards.length; i++) {
        const stepLabel = `step-${i}`;
        const targetCards = Array.from(cards).slice(i);
        tl.to(track, { x: -i * trackShiftPerStep, duration: 1, ease: "power2.inOut" }, stepLabel);
        tl.to(targetCards, { x: i * gap, rotation: rotations[i % rotations.length], duration: 1, ease: "power2.inOut" }, stepLabel);
        tl.to(cards[i], { rotation: 0, duration: 0.5, ease: "power1.inOut" }, `${stepLabel}+=0.5`);
      }
    });
    
    mm.add("(max-width: 991.98px)", () => {
      gsap.killTweensOf([track, cards]);
      gsap.set(track, { clearProps: "all" });
      gsap.set(cards, { clearProps: "all" });
    });
  }

  // --- Q. Benefits Section Stagger Animation (Home Page) ---
  const benefitsCol = document.querySelectorAll("#benefits-section .col");
  if (benefitsCol.length > 0) {
    benefitsCol.forEach(el => animatedElements.add(el));
    gsap.from(benefitsCol, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: "#benefits-section",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }

  // --- R. Team Cards RotateY Flip-in (About Page) ---
  const teamCards = document.querySelectorAll(".team-member-card");
  if (teamCards.length > 0) {
    teamCards.forEach(el => animatedElements.add(el));
    gsap.from(teamCards, {
      rotateY: 90,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: ".team-members-row",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }

  // --- S. Vision Badges Scale-in (About Page) ---
  const visionBadges = document.querySelectorAll(".badges-list .badge");
  if (visionBadges.length > 0) {
    visionBadges.forEach(el => animatedElements.add(el));
    gsap.from(visionBadges, {
      scale: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".badges-list",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }

  // --- T. Culture Cards Stagger Entrance (Careers Page) ---
  const cultureCards = document.querySelectorAll(".culture-card");
  if (cultureCards.length > 0) {
    cultureCards.forEach(el => animatedElements.add(el));
    gsap.from(cultureCards, {
      scale: 0.85,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: ".culture-cards-row",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }

  // --- U. Careers Step Cards Stagger (Careers Page) ---
  const careersTimelineItems = document.querySelectorAll(".careers-timeline .timeline-item");
  if (careersTimelineItems.length > 0) {
    careersTimelineItems.forEach(el => animatedElements.add(el));
    gsap.from(careersTimelineItems, {
      x: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".careers-timeline",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  }

  // --- V. Services CTA Banner Scale-in ---
  const ctaBanners = document.querySelectorAll(".cta-banner");
  if (ctaBanners.length > 0) {
    ctaBanners.forEach(el => animatedElements.add(el));
    gsap.from(ctaBanners, {
      scale: 0.92,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".cta-banner",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });
  }

  // --- W. Premium B2B Website Upgrades Animations ---
  
  // 1. Service Hero Entrance Animations
  const serviceHero = document.querySelector('.service-hero');
  if (serviceHero) {
    const heroTl = gsap.timeline({ delay: 0.2 });
    heroTl
      .from('.service-eyebrow', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from('.service-hero-h1', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from('.service-hero-sub', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .from('.trust-chip', { y: 16, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.2')
      .from('.hero-cta-group', { y: 16, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.code-window-mockup', { x: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.phone-frame-mockup', { x: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.custom-hero-mockup', { x: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
  }

  // 2. Feature grid stagger reveal
  if (document.querySelector('.feature-grid')) {
    const featCards = document.querySelectorAll('.feature-card');
    featCards.forEach(el => animatedElements.add(el));
    gsap.from(featCards, {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.65, ease: 'power3.out',
      scrollTrigger: { trigger: '.feature-grid', start: 'top 80%', toggleActions: 'play none none none' }
    });
  }

  // 3. Healthcare compliance badges, systems grid, and HIPAA section scale-in
  if (document.querySelector('.compliance-badges')) {
    const compBadges = document.querySelectorAll('.comp-badge');
    compBadges.forEach(el => animatedElements.add(el));
    gsap.from(compBadges, {
      scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.compliance-badges', start: 'top 85%' }
    });
  }
  if (document.querySelector('.systems-grid')) {
    const sysCards = document.querySelectorAll('.system-card');
    sysCards.forEach(el => animatedElements.add(el));
    gsap.from(sysCards, {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.systems-grid', start: 'top 80%' }
    });
  }
  if (document.querySelector('.hipaa-section')) {
    const hipaaSec = document.querySelectorAll('.hipaa-section');
    hipaaSec.forEach(el => animatedElements.add(el));
    gsap.from(hipaaSec, {
      scale: 0.96, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.hipaa-section', start: 'top 80%' }
    });
  }

  // 4. Enterprise dashboard live preview bar chart animation
  if (document.querySelector('.dashboard-preview-card')) {
    ScrollTrigger.create({
      trigger: '.dashboard-preview-card',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        document.querySelectorAll('.dash-bar').forEach((bar, i) => {
          gsap.from(bar, { scaleY: 0, transformOrigin: 'bottom', 
            duration: 0.6, delay: i * 0.08, ease: 'power3.out' });
        });
      }
    });
  }

  // 5. Redesigned footer animations
  if (document.querySelector('.site-footer')) {
    const footTaglines = document.querySelectorAll('.footer-tagline');
    footTaglines.forEach(el => animatedElements.add(el));
    gsap.from(footTaglines, {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 90%' }
    });
    const footCols = document.querySelectorAll('.footer-col');
    footCols.forEach(el => animatedElements.add(el));
    gsap.from(footCols, {
      y: 20, opacity: 0, stagger: 0.1, duration: 0.6,
      scrollTrigger: { trigger: '.footer-links-grid', start: 'top 92%' }
    });
    const socIcons = document.querySelectorAll('.social-icon');
    socIcons.forEach(el => animatedElements.add(el));
    gsap.from(socIcons, {
      scale: 0.7, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.footer-social', start: 'top 92%' }
    });
  }
}

// 5. Interactive Homepage Tabs Showcase
function initializeHomepageTabs() {
  const tabs = document.querySelectorAll(".showcase_tabs_btns .s_tab_btn");
  const contents = document.querySelectorAll(".s_tab_wrapper .s_tab");
  
  if (tabs.length === 0 || contents.length === 0) return;

  const tabsContainer = document.querySelector(".showcase_tabs_btns");
  let underline = tabsContainer.querySelector(".tab-underline-indicator");
  if (!underline) {
    underline = document.createElement("div");
    underline.classList.add("tab-underline-indicator");
    tabsContainer.appendChild(underline);
  }

  let isTransitioning = false;
  const rotationDelay = 5000;
  let autoRotateInterval;

  function updateUnderline(activeTabBtn) {
    const activeLi = activeTabBtn.closest("li");
    if (!activeLi) return;
    const rect = activeLi.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    const left = rect.left - containerRect.left;
    const width = rect.width;
    
    gsap.to(underline, {
      x: left,
      width: width,
      duration: 0.35,
      ease: "power2.out"
    });
  }

  function switchTab(index) {
    if (isTransitioning) return;
    const tab = tabs[index];
    const targetId = tab.getAttribute("data-tab");
    const activeTab = document.querySelector(".s_tab_wrapper .active-tab");
    const targetTab = document.querySelector(targetId);
    
    if (!targetTab || activeTab === targetTab) return;
    
    tabs.forEach(btn => btn.classList.remove("active"));
    tab.classList.add("active");
    updateUnderline(tab);
    
    if (typeof gsap !== "undefined") {
      isTransitioning = true;
      gsap.killTweensOf(contents);
      gsap.to(activeTab, {
        opacity: 0,
        y: 20,
        duration: 0.1,
        onComplete: () => {
          contents.forEach(c => c.classList.remove("active-tab"));
          targetTab.classList.add("active-tab");
          gsap.fromTo(targetTab, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.2, ease: "power2.out", onComplete: () => { isTransitioning = false; } }
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
      let activeIndex = 0;
      tabs.forEach((tab, idx) => { if (tab.classList.contains("active")) activeIndex = idx; });
      switchTab((activeIndex + 1) % tabs.length);
    }, rotationDelay);
  }

  function resetTimer() { clearInterval(autoRotateInterval); startAutoRotation(); }
  
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", (e) => { e.preventDefault(); switchTab(index); resetTimer(); });
  });

  startAutoRotation();

  setTimeout(() => {
    const activeBtn = tabsContainer.querySelector(".s_tab_btn.active") || tabs[0];
    if (activeBtn) updateUnderline(activeBtn);
  }, 200);

  window.addEventListener("resize", () => {
    const activeBtn = tabsContainer.querySelector(".s_tab_btn.active");
    if (activeBtn) updateUnderline(activeBtn);
  });
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
      
      stepperBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      if (typeof gsap !== "undefined") {
        gsap.to(activePanel, {
          opacity: 0,
          y: 15,
          duration: 0.25,
          onComplete: () => {
            activePanel.classList.remove("active-panel");
            targetPanel.classList.add("active-panel");
            gsap.fromTo(targetPanel, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
            const mockup = targetPanel.querySelector(".device-mockup-wrapper");
            const textHeading = targetPanel.querySelector("h3");
            const listHeaders = targetPanel.querySelectorAll("h5");
            const lists = targetPanel.querySelectorAll("ul");
            if (mockup) gsap.fromTo(mockup, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });
            if (textHeading) gsap.fromTo(textHeading, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
            if (listHeaders.length > 0) gsap.fromTo(listHeaders, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 });
            if (lists.length > 0) gsap.fromTo(lists, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
          }
        });
      } else {
        activePanel.classList.remove("active-panel");
        targetPanel.classList.add("active-panel");
      }
    });
  });
}

// 7. Global Upgrades Function
function initializeGlobalUpgrades() {
  // --- A. Custom Cursor ---
  if (window.innerWidth >= 992) {
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
      cursorX += (mouseX - cursorX) * 0.08;
      cursorY += (mouseY - cursorY) * 0.08;
      gsap.set(cursor, { x: cursorX, y: cursorY, xPercent: -50, yPercent: -50 });
    });

    document.querySelectorAll(".btn, a, .card, .office-card, .homepage-blog-card, .role-card, .s_tab_btn, .stepper-btn, .phase-node").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
    });
  }

  // --- B. Page Transitions ---
  document.body.style.opacity = "0";
  requestAnimationFrame(() => {
    document.body.style.transition = "opacity 300ms ease-in-out";
    document.body.style.opacity = "1";
  });

  const links = document.querySelectorAll("a:not([href^='#']):not([target='_blank']):not([href^='tel:']):not([href^='mailto:'])");
  links.forEach(link => {
    link.addEventListener("click", e => {
      if (link.hostname === window.location.hostname && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("javascript:")) {
          e.preventDefault();
          document.body.classList.add("page-fade-out");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        }
      }
    });
  });

  // --- C. Glass Navbar past 80px ---
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 80) {
        navbar.classList.add("navbar-glass");
      } else {
        navbar.classList.remove("navbar-glass");
      }
    });
  }

  // --- D. Stagger reveals for standard sections ---
  document.querySelectorAll("section:not(.hero-parallax-section):not(#roadmap-section):not(#testimonials):not(.services-hero):not(.services-content):not(.services-cta):not(#booking):not(#benefits-section)").forEach(section => {
    const listOrGrid = section.querySelectorAll(".row, .grid, ul, ol");
    if (listOrGrid.length > 0) {
      listOrGrid.forEach(container => {
        const children = Array.from(container.children).filter(child => !child.classList.contains("timeline-progress-line-container") && !animatedElements.has(child));
        if (children.length > 0) {
          children.forEach(el => animatedElements.add(el));
          gsap.from(children, {
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          });
        }
      });
    } else {
      const sectionChildren = Array.from(section.children).filter(child => !animatedElements.has(child));
      if (sectionChildren.length > 0) {
        sectionChildren.forEach(el => animatedElements.add(el));
        gsap.from(sectionChildren, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });
      }
    }
  });

  // --- E. Typing animations on Hero H1s (TextPlugin) ---
  document.querySelectorAll(".hero-parallax-section h1, .services-hero h1").forEach(h1 => {
    const textContent = h1.innerText.trim();
    const isServiceHero = h1.closest(".services-hero") !== null;
    if (isServiceHero || textContent.length < 60) {
      h1.innerText = "";
      gsap.to(h1, {
        text: textContent,
        duration: textContent.length * 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: h1,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });
    }
  });

  // --- F. Specialties Cards Perspective Tilt ---
  const tiltCards = document.querySelectorAll(".specialty-card");
  tiltCards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rX = -(y / (rect.height / 2)) * 10;
      const rY = (x / (rect.width / 2)) * 10;
      card.style.setProperty("--rx", `${rX}deg`);
      card.style.setProperty("--ry", `${rY}deg`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", `0deg`);
      card.style.setProperty("--ry", `0deg`);
    });
  });

  // --- G. Careers timeline and drawing line ---
  const timelineProgress = document.querySelector(".timeline-progress-line");
  if (timelineProgress) {
    gsap.fromTo(timelineProgress, 
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline-wrapper",
          start: "top 60%",
          end: "bottom 80%",
          scrub: true
        }
      }
    );
  }

  // --- H. Testimonials mobile carousel auto-advance ---
  initializeTestimonialsCarousel();
}

// Mobile Testimonials Carousel Auto-advance
function initializeTestimonialsCarousel() {
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  if (testimonialCards.length === 0) return;

  let activeTestimonialIndex = 0;
  let testimonialInterval;

  function showTestimonial(index) {
    testimonialCards.forEach((card, idx) => {
      if (idx === index) {
        card.style.display = "block";
        gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      } else {
        card.style.display = "none";
      }
    });
  }

  function startTestimonialsCarousel() {
    if (window.innerWidth < 992) {
      showTestimonial(0);
      testimonialInterval = setInterval(() => {
        activeTestimonialIndex = (activeTestimonialIndex + 1) % testimonialCards.length;
        const activeCard = testimonialCards[activeTestimonialIndex];
        
        let prevCard;
        testimonialCards.forEach(c => {
          if (c.style.display === "block") prevCard = c;
        });

        if (prevCard && activeCard) {
          gsap.to(prevCard, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              prevCard.style.display = "none";
              activeCard.style.display = "block";
              gsap.fromTo(activeCard, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            }
          });
        }
      }, 5000);
    } else {
      testimonialCards.forEach(card => card.style.display = "");
      clearInterval(testimonialInterval);
    }
  }

  startTestimonialsCarousel();
  window.addEventListener("resize", () => {
    clearInterval(testimonialInterval);
    startTestimonialsCarousel();
  });
}
