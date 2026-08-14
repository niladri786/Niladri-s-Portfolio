document.addEventListener('DOMContentLoaded', () => {
  const FRAME_COUNT = 143;
  const frames = [];
  let loadedCount = 0;

  // DOM Elements
  const loader = document.getElementById('loader');
  const loaderPercentage = document.getElementById('loader-percentage');
  const loaderBar = document.getElementById('loader-bar');
  const loaderStatus = document.getElementById('loader-status');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const hudFrame = document.getElementById('hud-frame');
  const hudProgress = document.getElementById('hud-progress');

  // Animation State
  let targetFrame = 0;
  let currentFrame = 0;

  // Format hero frame path: frames/frame_00001.png
  function getFramePath(index) {
    const paddedIndex = String(index + 1).padStart(5, '0');
    return `frames/frame_${paddedIndex}.png`;
  }

  // Preload all hero canvas frames
  function preloadFrames() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
        
        if (loaderPercentage) loaderPercentage.textContent = `${percent}%`;
        if (loaderBar) loaderBar.style.width = `${percent}%`;

        // Render frame 0 immediately when loaded
        if (i === 0) {
          resizeCanvas();
          renderFrame(0);
        }

        if (loadedCount === FRAME_COUNT) {
          onAllFramesLoaded();
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          onAllFramesLoaded();
        }
      };

      frames.push(img);
    }
  }

  function onAllFramesLoaded() {
    if (loaderStatus) loaderStatus.textContent = 'Welcome!';
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 400);

    resizeCanvas();
    startAnimationLoop();
  }

  // Cover Math Canvas Renderer
  function renderFrame(frameIndex) {
    if (!ctx || !canvas) return;

    const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(frameIndex)));
    const img = frames[index];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();

    // Update HUD display
    const displayIndex = String(index + 1).padStart(3, '0');
    if (hudFrame) hudFrame.textContent = `${displayIndex} / ${FRAME_COUNT}`;
    if (hudProgress) {
      const progressPercent = Math.floor((index / (FRAME_COUNT - 1)) * 100);
      hudProgress.textContent = `${progressPercent}%`;
    }
  }

  function resizeCanvas() {
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    renderFrame(currentFrame);
  }

  // Calculate Frame Index based on page scroll
  function updateScrollTarget() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    if (maxScroll <= 0) return;

    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
    targetFrame = scrollFraction * (FRAME_COUNT - 1);
  }

  // LERP Animation Loop for 60fps/120fps Smooth Video Background
  function startAnimationLoop() {
    function loop() {
      const diff = targetFrame - currentFrame;
      
      if (Math.abs(diff) > 0.001) {
        currentFrame += diff * 0.12;
        renderFrame(currentFrame);
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  // Dynamic Navbar Scroll Glassmorphism State
  const navbarEl = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbarEl?.classList.add('scrolled');
    } else {
      navbarEl?.classList.remove('scrolled');
    }
  }

  // Mobile Navigation Drawer Toggle Handler
  const navToggleBtn = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  if (navToggleBtn && navLinksContainer) {
    navToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggleBtn.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
    });

    // Close mobile drawer when clicking any navigation link
    const allNavLinks = navLinksContainer.querySelectorAll('a');
    allNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggleBtn.classList.remove('active');
        navLinksContainer.classList.remove('active');
      });
    });

    // Close drawer when tapping outside nav
    document.addEventListener('click', (e) => {
      if (navbarEl && !navbarEl.contains(e.target) && navLinksContainer.classList.contains('active')) {
        navToggleBtn.classList.remove('active');
        navLinksContainer.classList.remove('active');
      }
    });
  }

  // Mobile & Tablet Orientation Notice Dismiss Handler
  const orientationNotice = document.getElementById('orientation-notice');
  const orientationCloseBtn = document.getElementById('orientation-close-btn');

  if (orientationNotice && orientationCloseBtn) {
    orientationCloseBtn.addEventListener('click', () => {
      orientationNotice.style.display = 'none';
    });
  }

  // Smart Footer Mail Redirect Handler (PC/Laptop/Mac -> Exact Compose URL / Mobile/Tablet -> Native App)
  const footerMailCards = document.querySelectorAll('.footer-mail-card');
  footerMailCards.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                               window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
                               window.innerWidth <= 992;

      if (isMobileOrTablet) {
        window.location.href = 'mailto:niladribusiness08@gmail.com';
      } else {
        window.open('https://mail.google.com/mail/u/0/#inbox?compose=jrjtXDzgmMLFLtBxCqCTJBCNWDqBrrSpmFRfHnZdXcKrMWVrGCjFXDdtNfShBTwqtWKSgTtC', '_blank');
      }
    });
  });

  // Interactive Tools Click to Reveal Handler
  const toolCards = document.querySelectorAll('.tool-card');
  const revealAllToolsBtn = document.getElementById('reveal-all-tools-btn');

  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('locked')) {
        card.classList.remove('locked');
        card.classList.add('revealed');
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (card.classList.contains('locked')) {
          card.classList.remove('locked');
          card.classList.add('revealed');
        }
      }
    });
  });

  if (revealAllToolsBtn) {
    revealAllToolsBtn.addEventListener('click', () => {
      toolCards.forEach(card => {
        card.classList.remove('locked');
        card.classList.add('revealed');
      });
      revealAllToolsBtn.style.display = 'none';
    });
  }

  // Event Listeners
  window.addEventListener('scroll', () => {
    updateScrollTarget();
    handleNavbarScroll();
  }, { passive: true });
  window.addEventListener('resize', resizeCanvas);

  // Custom Animated Cursor System (Desktop & Mobile Touch)
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    function updateCursorPosition(x, y) {
      mouseX = x;
      mouseY = y;

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;

      document.body.classList.remove('cursor-hidden');
    }

    window.addEventListener('mousemove', (e) => {
      updateCursorPosition(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
        document.body.classList.add('cursor-active');
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      document.body.classList.remove('cursor-active');
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      document.body.classList.add('cursor-hidden');
    });

    document.addEventListener('mouseenter', () => {
      document.body.classList.remove('cursor-hidden');
    });

    // Smooth Lerp Spring Trajectory for Ring
    function animateCursorRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(animateCursorRing);
    }
    requestAnimationFrame(animateCursorRing);

    // Hover Scaling Detection on Interactive Elements
    const interactiveSel = 'a, button, .work-item, .contact-card, .btn, input, textarea, select, .nav-brand, .nav-link, .nav-cta';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSel)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSel)) {
        document.body.classList.remove('cursor-hover');
      }
    });

    // Tactile Click Feedback
    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-active');
    });
  }

    // Interactive Featured Testimonials Slider Controller
    const featuredDisplay = document.getElementById('featured-testimonial-card');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('testimonial-prev-btn');
    const nextBtn = document.getElementById('testimonial-next-btn');

    if (featuredDisplay && dotsContainer && prevBtn && nextBtn) {
      const featuredTestimonials = [
        {
          name: "Alex Rivera",
          channel: "TechVision • 850K Subs",
          avatarClass: "avatar-yt",
          initials: "AR",
          platformIcon: "fa-brands fa-youtube platform-icon yt",
          rating: 5,
          quote: "Niladri completely transformed our channel's visual identity. His high-CTR thumbnails boosted our click-through rate from 5.2% to 11.8% in under two weeks! Absolute game changer for tech creators.",
          metric: "+127% CTR Boost",
          tag: "Tech Channel"
        },
        {
          name: "Sarah Chen",
          channel: "Sarah Vlogs • 420K Subs",
          avatarClass: "avatar-tw",
          initials: "SC",
          platformIcon: "fa-brands fa-youtube platform-icon yt",
          rating: 5,
          quote: "Working with Niladri is effortless. Turnaround is lightning fast, and every thumbnail has a compelling visual hook. Our video views literally doubled after switching to his designs!",
          metric: "2.4M+ Views",
          tag: "Vlog & Lifestyle"
        },
        {
          name: "Marcus Vance",
          channel: "Vance Gaming • 1.2M Subs",
          avatarClass: "avatar-ig",
          initials: "MV",
          platformIcon: "fa-brands fa-youtube platform-icon yt",
          rating: 5,
          quote: "The expression retouching and lighting depth Niladri puts into thumbnail designs are top tier. You can tell he understands YouTube visual psychology inside out.",
          metric: "Top Tier Hooks",
          tag: "Gaming Channel"
        },
        {
          name: "Elena Rostova",
          channel: "Media Lead @ CreatorPulse",
          avatarClass: "avatar-brand",
          initials: "ER",
          platformIcon: "fa-solid fa-building platform-icon brand",
          rating: 5,
          quote: "Niladri has been our go-to designer for social media posters & YouTube thumbnails for 2+ years. Revisions are fast and the overall output always exceeds expectations.",
          metric: "Long-term Partner",
          tag: "Agency & Brand"
        }
      ];

      let currentSlide = 0;
      let autoSlideInterval = null;

      function renderSlide(index) {
        const data = featuredTestimonials[index];
        
        const starsHtml = Array(data.rating).fill('<i class="fa-solid fa-star"></i>').join('');

        featuredDisplay.innerHTML = `
          <div class="featured-card-inner">
            <div class="featured-quote-side">
              <i class="fa-solid fa-quote-left quote-icon" style="color: var(--purple-accent); font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
              "${data.quote}"
            </div>
            <div class="featured-profile-side">
              <div class="creator-profile">
                <div class="creator-avatar ${data.avatarClass}">
                  <span>${data.initials}</span>
                </div>
                <div class="creator-info">
                  <h4 class="creator-name">${data.name} <i class="fa-solid fa-circle-check verified-icon"></i></h4>
                  <span class="creator-channel"><i class="${data.platformIcon}"></i> ${data.channel}</span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <div class="testimonial-rating">
                  ${starsHtml}
                </div>
                <span class="metric-pill"><i class="fa-solid fa-chart-line"></i> ${data.metric}</span>
              </div>
            </div>
          </div>
        `;

        // Update active dot
        const allDots = dotsContainer.querySelectorAll('.slider-dot');
        allDots.forEach((dot, dIdx) => {
          if (dIdx === index) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }

      function createDots() {
        dotsContainer.innerHTML = '';
        featuredTestimonials.forEach((_, idx) => {
          const dot = document.createElement('div');
          dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
          dot.addEventListener('click', () => {
            currentSlide = idx;
            renderSlide(currentSlide);
            resetAutoSlide();
          });
          dotsContainer.appendChild(dot);
        });
      }

      function nextSlide() {
        currentSlide = (currentSlide + 1) % featuredTestimonials.length;
        renderSlide(currentSlide);
      }

      function prevSlide() {
        currentSlide = (currentSlide - 1 + featuredTestimonials.length) % featuredTestimonials.length;
        renderSlide(currentSlide);
      }

      function startAutoSlide() {
        if (!autoSlideInterval) {
          autoSlideInterval = setInterval(nextSlide, 6000);
        }
      }

      function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
        startAutoSlide();
      }

      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
      });

      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
      });

      const sliderContainer = document.querySelector('.testimonial-slider-container');
      if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        sliderContainer.addEventListener('mouseleave', () => startAutoSlide());
      }

      createDots();
      renderSlide(0);
      startAutoSlide();
    }

    // FAQ Interactive Accordion Controller
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          
          // Close other FAQ items
          faqItems.forEach(other => {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          });

          // Toggle clicked item
          if (!isActive) {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });

    // Initial call
    preloadFrames();
  });

// Lightbox Modal Controller Functions
function openLightbox(src, title) {
  const modal = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  if (modal && img) {
    img.src = src;
    if (caption) caption.textContent = title || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox(event) {
  if (event && event.target && event.target.tagName === 'IMG') return;

  const modal = document.getElementById('lightbox');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}
