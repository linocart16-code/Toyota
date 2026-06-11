let slideIndex = 1;
let slideTimer;

// Vehicle search data
const vehicles = [
  { name: 'Wigo', url: '/vehicle/wigo' },
  { name: 'Vios', url: '/vehicle/vios' },
  { name: 'ATIV', url: '/vehicle/ativ' },
  { name: 'Corolla Altis', url: '/vehicle/corolla_altis' },
  { name: 'Camry', url: '/vehicle/camry' },
  { name: 'Raize', url: '/vehicle/raize' },
  { name: 'Veloz', url: '/vehicle/veloz' },
  { name: 'Rush', url: '/vehicle/rush' },
  { name: 'Corolla Cross', url: '/vehicle/corolla_cross' },
  { name: 'Yaris Cross', url: '/vehicle/yaris_cross' },
  { name: 'RAV4', url: '/vehicle/rav4' },
  { name: 'Fortuner', url: '/vehicle/fortuner' },
  { name: 'Land Cruiser Prado', url: '/vehicle/land_cruiser_prado' },
  { name: 'bZ4X', url: '/vehicle/bz4x' },
  { name: 'Avanza', url: '/vehicle/avanza' },
  { name: 'Innova', url: '/vehicle/innova' },
  { name: 'Zenix', url: '/vehicle/zenix' },
  { name: 'Alphard', url: '/vehicle/alphard' },
  { name: 'Hiace', url: '/vehicle/hiace' },
  { name: 'Coaster', url: '/vehicle/coaster' },
  { name: 'Hilux', url: '/vehicle/hilux' },
  { name: 'Hilux Fleet', url: '/vehicle/hilux_fleet' },
  { name: 'Tamaraw', url: '/vehicle/tamaraw' },
  { name: 'Lite Ace', url: '/vehicle/lite_ace' }
];

// Toggle search input
function toggleSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    if (searchInput.style.width === '0px' || searchInput.style.display === 'none' || searchInput.style.width === '') {
      searchInput.style.display = 'block';
      searchInput.style.width = '180px';
      setTimeout(function() { searchInput.focus(); }, 100);
    } else {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
      } else {
        searchInput.style.width = '0px';
        searchInput.style.padding = '0px';
        setTimeout(function() {
          searchInput.style.display = 'none';
          searchInput.value = '';
        }, 300);
      }
    }
  }
}

// Perform search
function performSearch(query) {
  query = query.toLowerCase();
  const found = vehicles.find(function(v) {
    return v.name.toLowerCase().includes(query);
  });
  if (found) {
    window.location.href = found.url;
  } else {
    alert('Vehicle not found. Try: Wigo, Vios, ATIV, Camry, Raize, Veloz, Rush, Corolla Cross, RAV4, Fortuner, etc.');
  }
}

// Slideshow functions
function showSlide(n) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  
  slides.forEach(function(slide) {
    slide.style.display = 'none';
  });
  
  dots.forEach(function(dot) {
    dot.classList.remove('active');
  });
  
  slides[slideIndex - 1].style.display = 'block';
  dots[slideIndex - 1].classList.add('active');
  
  // Update text content based on current slide
  const currentSlide = slides[slideIndex - 1];
  const title = currentSlide.getAttribute('data-title');
  const desc = currentSlide.getAttribute('data-desc');
  
  document.getElementById('slide-title').textContent = title;
  document.getElementById('slide-desc').textContent = desc;
}

function currentSlideFunc(n) {
  clearTimeout(slideTimer);
  showSlide(slideIndex = n);
  startSlideshow();
}

function nextSlide() {
  showSlide(++slideIndex);
}

function startSlideshow() {
  slideTimer = setTimeout(function() {
    nextSlide();
    startSlideshow();
  }, 5000); // Change slide every 5 seconds
}

// Initialize slideshow when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize search input event listeners
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          performSearch(query);
        }
      }
    });
    
    // Close search on blur if empty
    searchInput.addEventListener('blur', function() {
      if (!searchInput.value.trim()) {
        searchInput.style.width = '0px';
        searchInput.style.padding = '0px';
      }
    });
  }
  
  // Initialize slideshow
  showSlide(slideIndex);
  startSlideshow();

  // --- OUR LINEUP SLIDER LOGIC ---
  const lineupSlider = document.getElementById('lineup-slider');
  const leftBtn = document.getElementById('lineup-arrow-left');
  const rightBtn = document.getElementById('lineup-arrow-right');
  if (lineupSlider && leftBtn && rightBtn) {
    const cardWidth = 240;
    const gap = 28;
    const slideDistance = cardWidth + gap;
    const totalCards = lineupSlider.children.length;
    const visibleCards = 3;
    const centerOffset = Math.floor(visibleCards / 2);
    const pages = Math.max(1, Math.ceil(totalCards / visibleCards));
    let pageIndex = 0;

    const viewport = document.querySelector('.lineup-viewport');
    const paginationEl = document.getElementById('lineup-pagination');

    function updateSlider() {
      const maxStart = Math.max(0, totalCards - visibleCards);
      const startIndex = Math.min(pageIndex * visibleCards, maxStart);

      const groupWidth = visibleCards * cardWidth + (visibleCards - 1) * gap;
      const groupCenterX = startIndex * slideDistance + groupWidth / 2;
      const viewportWidth = viewport.clientWidth;
      let translate = groupCenterX - viewportWidth / 2;

      const maxTranslate = Math.max(0, totalCards * slideDistance - viewportWidth + gap);
      if (translate < 0) translate = 0;
      if (translate > maxTranslate) translate = maxTranslate;

      lineupSlider.style.transform = 'translateX(-' + translate + 'px)';

      const centerIndex = Math.min(totalCards - 1, startIndex + centerOffset);

      Array.from(lineupSlider.children).forEach(function(c, i) {
        c.classList.toggle('active-card', i === centerIndex);
      });

      leftBtn.disabled = pageIndex <= 0;
      rightBtn.disabled = pageIndex >= pages - 1;
      if (paginationEl) paginationEl.textContent = (pageIndex + 1) + ' / ' + pages;
    }

    leftBtn.addEventListener('click', function() {
      if (pageIndex > 0) pageIndex--;
      updateSlider();
    });

    rightBtn.addEventListener('click', function() {
      if (pageIndex < pages - 1) pageIndex++;
      updateSlider();
    });

    // initialize
    updateSlider();
    // handle window resize
    window.addEventListener('resize', updateSlider);
  }
});
