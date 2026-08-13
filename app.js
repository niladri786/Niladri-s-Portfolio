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

  // Format frame path: frames/frame_00001.png
  function getFramePath(index) {
    const paddedIndex = String(index + 1).padStart(5, '0');
    return `frames/frame_${paddedIndex}.png`;
  }

  // Preload all 240 frames
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

  // Direct Gmail Compose Redirect Handler
  const gmailComposeLinks = document.querySelectorAll('.gmail-compose-link');
  gmailComposeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://mail.google.com/mail/?view=cm&fs=1&to=niladribusiness08@gmail.com', '_blank');
    });
  });

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

  // Floating Custom Image Scrollbar Widget Controller (Desktop & Mobile)
  const scrollTrack = document.getElementById('custom-scroll-track');
  const scrollThumb = document.getElementById('custom-scroll-thumb');

  if (scrollTrack && scrollThumb) {
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    function updateCustomScrollbar() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const trackHeight = scrollTrack.clientHeight - scrollThumb.clientHeight;
      const scrollFraction = window.scrollY / docHeight;
      const thumbTop = Math.max(0, Math.min(trackHeight, scrollFraction * trackHeight));

      scrollThumb.style.top = `${thumbTop}px`;
    }

    window.addEventListener('scroll', updateCustomScrollbar, { passive: true });
    window.addEventListener('resize', updateCustomScrollbar);
    updateCustomScrollbar();

    // Click track to jump
    scrollTrack.addEventListener('click', (e) => {
      if (e.target === scrollThumb || scrollThumb.contains(e.target)) return;
      const rect = scrollTrack.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const trackHeight = scrollTrack.clientHeight;
      const targetFraction = Math.max(0, Math.min(1, clickY / trackHeight));
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: targetFraction * docHeight, behavior: 'smooth' });
    });

    // Mouse & Touch Dragging
    function handleDragStart(clientY) {
      isDragging = true;
      startY = clientY;
      startScrollTop = window.scrollY;
      document.body.classList.add('cursor-active');
    }

    function handleDragMove(clientY) {
      if (!isDragging) return;
      const deltaY = clientY - startY;
      const trackHeight = scrollTrack.clientHeight - scrollThumb.clientHeight;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (trackHeight > 0 && docHeight > 0) {
        const scrollDelta = (deltaY / trackHeight) * docHeight;
        window.scrollTo(0, startScrollTop + scrollDelta);
      }
    }

    function handleDragEnd() {
      if (isDragging) {
        isDragging = false;
        document.body.classList.remove('cursor-active');
      }
    }

    scrollThumb.addEventListener('mousedown', (e) => {
      handleDragStart(e.clientY);
      e.preventDefault();
    });

    scrollThumb.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        handleDragStart(e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      handleDragMove(e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches && e.touches[0]) {
        handleDragMove(e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
  }

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
