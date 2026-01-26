// === PAGE LOADER LOGIC (ROBUST) ===
window.addEventListener('DOMContentLoaded', function() {
	const loader = document.getElementById('page-loader');
	if (!loader) return;

	function waitForCriticalImages(callback, timeout = 4000) {
		const imgs = Array.from(document.querySelectorAll('.projects-rz-list img')).slice(0, 3);
		if (!imgs.length) {
			callback();
			return;
		}
		let loaded = 0, done = false;
		function finish() {
			if (!done) {
				done = true;
				callback();
			}
		}
		imgs.forEach(img => {
			if (img.complete && img.naturalWidth !== 0) {
				loaded++;
				if (loaded === imgs.length) finish();
			} else {
				img.addEventListener('load', () => {
					loaded++;
					if (loaded === imgs.length) finish();
				});
				img.addEventListener('error', () => {
					loaded++;
					if (loaded === imgs.length) finish();
				});
			}
		});
		setTimeout(finish, timeout); // Fallback: always finish after timeout
	}

	window.addEventListener('load', function() {
		waitForCriticalImages(() => {
			setTimeout(() => {
				loader.classList.add('hide');
				setTimeout(() => {
					loader.style.display = 'none';
				}, 700);
			}, 600);
		});
	});
});
// === Premium Editorial Approach Timeline Animation ===
document.addEventListener('DOMContentLoaded', function () {
	var timelineCol = document.querySelector('.process-timeline-col');
	var spine = document.querySelector('.process-timeline-spine');
	var steps = Array.from(document.querySelectorAll('.process-step'));
	var contentSteps = Array.from(document.querySelectorAll('.process-step-content'));
	if (!timelineCol || !spine || !steps.length || !contentSteps.length) return;

	function isMobile() {
		return window.innerWidth <= 600;
	}

	function animateTimeline() {
		if (isMobile()) {
			spine.style.display = 'none';
			contentSteps.forEach(function(cs) {
				cs.style.opacity = 1;
				cs.style.transform = 'none';
			});
			return;
		}
		spine.style.display = '';

		// Calculate dot positions
		var timelineRect = timelineCol.getBoundingClientRect();
		var lineTop = 0;
		var lineHeight = timelineCol.offsetHeight;
		var dotCenters = steps.map(function(step) {
			var dot = step.querySelector('.process-dot');
			var rect = dot.getBoundingClientRect();
			return rect.top + rect.height / 2 - timelineRect.top;
		});

		// Line: always full height, green
		spine.style.top = lineTop + 'px';
		spine.style.height = lineHeight + 'px';
		spine.style.background = `linear-gradient(to bottom, #2de1a6 0%, #2de1a6 100%)`;

		// Calculate scroll progress through section
		var sectionTop = timelineRect.top;
		var sectionBottom = timelineRect.bottom;
		var viewportHeight = window.innerHeight;
		var progress = Math.min(1, Math.max(0, (viewportHeight/2 - sectionTop) / (sectionBottom - sectionTop)));

		// Dot moves from top to bottom of line
		var dotMin = 0 + 7; // top of line + radius
		var dotMax = lineHeight - 7; // bottom of line - radius
		var dotY = dotMin + (dotMax - dotMin) * progress;

		// Move cursor dot
		var cursorDot = document.querySelector('.process-cursor-dot');
		if (cursorDot) {
			cursorDot.style.top = dotY + 'px';
		}

		// Find active step (closest to dot)
		var activeIdx = 0;
		var minDist = Infinity;
		dotCenters.forEach(function(center, i) {
			var dist = Math.abs(dotY - center);
			if (dist < minDist) {
				minDist = dist;
				activeIdx = i;
			}
		});

		// Animate text for active step
		contentSteps.forEach(function(content, i) {
			var label = content.querySelector('.process-label');
			var desc = content.querySelector('.process-desc');
			if (i === activeIdx) {
				content.classList.add('active');
				content.classList.remove('past', 'future');
				if (label) label.classList.add('active');
				if (desc) desc.classList.add('active');
			} else if (i < activeIdx) {
				content.classList.add('past');
				content.classList.remove('active', 'future');
				if (label) label.classList.remove('active');
				if (desc) desc.classList.remove('active');
			} else {
				content.classList.add('future');
				content.classList.remove('active', 'past');
				if (label) label.classList.remove('active');
				if (desc) desc.classList.remove('active');
			}
		});
	}

	animateTimeline();
	window.addEventListener('scroll', animateTimeline, { passive: true });
	window.addEventListener('resize', animateTimeline);
});
// === Riccardo Zanutta-style Projects Section: Green overlay sweep and in-view effect ===
document.addEventListener('DOMContentLoaded', () => {
	const rzProjects = document.querySelectorAll('.project-rz');
	if (rzProjects.length && 'IntersectionObserver' in window) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view');
				} else {
					entry.target.classList.remove('in-view');
				}
			});
		}, { threshold: 0.45 });
		rzProjects.forEach(card => observer.observe(card));
	}
});

// === Animate divider accent line and text fade in/out on scroll (repeats) ===
document.addEventListener('DOMContentLoaded', function () {
	var accent = document.querySelector('.divider-accent');
	var trustText = document.querySelector('.trust-text');
	var micro = document.querySelector('.micro-transition');
	if (!accent || !trustText) return;
	function animateAccent(entries) {
		entries.forEach(function(entry) {
						if (entry.isIntersecting) {
								// Remove and re-add to force animation restart
								accent.classList.remove('animated');
								void accent.offsetWidth;
								accent.classList.add('animated');
								trustText.classList.remove('fade-out');
								trustText.classList.remove('fade-in');
								void trustText.offsetWidth;
								trustText.classList.add('fade-in');
								if (micro) {
									micro.classList.remove('fade-out');
									micro.classList.remove('fade-in');
									void micro.offsetWidth;
									micro.classList.add('fade-in');
								}
						} else {
								accent.classList.remove('animated');
								trustText.classList.remove('fade-in');
								trustText.classList.add('fade-out');
								if (micro) {
									micro.classList.remove('fade-in');
									micro.classList.add('fade-out');
								}
						}
		});
	}
	var observer = new window.IntersectionObserver(animateAccent, {
		root: null,
		threshold: 0.6
	});
	observer.observe(accent);
});
// === Riccardo Zanutta-style Projects Section: Animate carousel on hover ===
document.addEventListener('DOMContentLoaded', () => {
	function isMobile() {
		return window.innerWidth <= 700 || /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
	document.querySelectorAll('.project-rz').forEach(project => {
		const carousel = project.querySelector('.carousel-track');
		if (!carousel) return;
		const images = Array.from(carousel.children);
		let idx = 0;
		let interval = null;
		function show(i) {
			idx = (i + images.length) % images.length;
			carousel.style.transform = `translateX(-${idx * 100}%)`;
		}
		function start() {
			if (interval) clearInterval(interval);
			interval = setInterval(() => show(idx + 1), 1200);
		}
		function stop() {
			if (interval) clearInterval(interval);
			interval = null;
		}
		// On mobile, always auto-advance
		if (isMobile()) {
			start();
			// Also restart on orientation change or resize
			window.addEventListener('resize', () => {
				if (isMobile()) start();
				else stop();
			});
		} else {
			project.addEventListener('mouseenter', start);
			project.addEventListener('focusin', start);
			project.addEventListener('mouseleave', stop);
			project.addEventListener('focusout', stop);
			// Reset to first image on mouseleave/focusout
			project.addEventListener('mouseleave', () => show(0));
			project.addEventListener('focusout', () => show(0));
		}
		// Always show first image on load
		show(0);
	});
});
// =================== PROJECTS PARALLAX AUTO-SCROLL ===================
document.addEventListener('DOMContentLoaded', () => {
	const parallax = document.getElementById('projects-parallax');
	if (parallax) {
		let autoScroll;
		let scrollAmount = 0.7; // px per frame
		let paused = false;
		function startAutoScroll() {
			if (autoScroll) cancelAnimationFrame(autoScroll);
			function step() {
				if (!paused) {
					parallax.scrollLeft += scrollAmount;
					// Loop to start if at end
					if (parallax.scrollLeft + parallax.clientWidth >= parallax.scrollWidth - 2) {
						parallax.scrollLeft = 0;
					}
				}
				autoScroll = requestAnimationFrame(step);
			}
			autoScroll = requestAnimationFrame(step);
		}
		parallax.addEventListener('mouseenter', () => { paused = true; });
		parallax.addEventListener('mouseleave', () => { paused = false; });
		parallax.addEventListener('focusin', () => { paused = true; });
		parallax.addEventListener('focusout', () => { paused = false; });
		startAutoScroll();
	}
});
// =================== APPROACH TIMELINE ANIMATION ===================
document.addEventListener('DOMContentLoaded', () => {
	const timeline = document.querySelector('.approach-timeline');
	const steps = document.querySelectorAll('.approach-timeline-step');
	const dots = document.querySelectorAll('.approach-timeline-dot');
	if (timeline && steps.length) {
		function activateStep() {
			const rect = timeline.getBoundingClientRect();
			const vh = window.innerHeight;
			const progress = Math.min(1, Math.max(0, (vh/2 - rect.top) / (rect.height)));
			const activeIdx = Math.floor(progress * steps.length);
			steps.forEach((step, i) => {
				step.classList.remove('active');
				if (i < activeIdx) step.style.opacity = 0.4;
				else if (i === activeIdx) {
					step.classList.add('active');
					// Micro-pulse for dot
					const dot = step.querySelector('.approach-timeline-dot');
					if (dot) {
						dot.classList.remove('pulse');
						void dot.offsetWidth;
						dot.classList.add('pulse');
						setTimeout(() => dot.classList.remove('pulse'), 600);
					}
				} else step.style.opacity = 0.25;
			});
		}
		window.addEventListener('scroll', activateStep);
		activateStep();
		// Fade-in steps as they appear
		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver((entries, obs) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.style.opacity = 1;
						entry.target.style.transform = 'none';
						obs.unobserve(entry.target);
					}
				});
			}, { threshold: 0.18 });
			steps.forEach(step => observer.observe(step));
		} else {
			steps.forEach(step => { step.style.opacity = 1; step.style.transform = 'none'; });
		}
	}
});
// =================== PROJECTS PARALLAX & FADE-IN ANIMATION ===================
document.addEventListener('DOMContentLoaded', () => {
	const parallax = document.getElementById('projects-parallax');
	const cards = document.querySelectorAll('.parallax-card');
	if (parallax && cards.length) {
		function parallaxScroll() {
			const rect = parallax.getBoundingClientRect();
			const vh = window.innerHeight;
			// Make the scroll even more pronounced and smooth
			const offset = Math.max(0, Math.min(1, (vh*0.7 - rect.top) / (vh + rect.height)));
			// Dramatic left-to-right movement
			parallax.style.transform = `translateX(${(offset-0.5)*420}px)`;
		}
		window.addEventListener('scroll', parallaxScroll);
		parallaxScroll();
		// Fade-in cards as they appear
		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver((entries, obs) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
						obs.unobserve(entry.target);
					}
				});
			}, { threshold: 0.22 });
			cards.forEach(card => observer.observe(card));
		} else {
			cards.forEach(card => card.classList.add('visible'));
		}
	}
});
// =================== CAPABILITIES CARD ENTRANCE ANIMATION ===================
document.addEventListener('DOMContentLoaded', () => {
	const cards = document.querySelectorAll('.service-animated-card');
	if (!cards.length) return;
	const revealCards = (entries, observer) => {
		entries.forEach((entry, i) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
				observer.unobserve(entry.target);
			}
		});
	};
	const observer = new window.IntersectionObserver(revealCards, {
		threshold: 0.18
	});
	cards.forEach((card, i) => {
		card.style.transitionDelay = `${i * 0.13 + 0.1}s`;
		observer.observe(card);
	});
});
// AUREX STUDIO – Main JS
// =================== NAVIGATION ===================
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle?.addEventListener('click', () => {
	const expanded = navToggle.getAttribute('aria-expanded') === 'true';
	navToggle.setAttribute('aria-expanded', !expanded);
	mobileMenu.hidden = expanded;
	mobileMenu.setAttribute('aria-hidden', expanded ? 'true' : 'false');
});

navLinks.forEach(link => {
	link.addEventListener('click', () => {
		navLinks.forEach(l => l.classList.remove('active'));
		link.classList.add('active');
		if (window.innerWidth < 1024) {
			navToggle.setAttribute('aria-expanded', false);
			mobileMenu.hidden = true;
			mobileMenu.setAttribute('aria-hidden', 'true');
		}
	});
});

// Sticky navbar after scroll
window.addEventListener('scroll', () => {
	const navbar = document.getElementById('navbar');
	if (window.scrollY > 40) {
		navbar.classList.add('scrolled');
	} else {
		navbar.classList.remove('scrolled');
	}
});

// =================== HERO ANIMATIONS ===================
window.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.reveal-line').forEach((el, i) => {
		el.style.animationDelay = `${0.1 + i * 0.12}s`;
	});
});

// =================== PROJECT CAROUSELS ===================
document.querySelectorAll('[data-carousel]').forEach(carousel => {
	const track = carousel.querySelector('.carousel-track');
	const images = Array.from(track.children);
	let idx = 0;
	let interval;
	const prevBtn = carousel.querySelector('.carousel-prev');
	const nextBtn = carousel.querySelector('.carousel-next');

	function show(idxNew) {
		idx = (idxNew + images.length) % images.length;
		track.style.transform = `translateX(-${idx * 100}%)`;
	}
	function next() { show(idx + 1); }
	function prev() { show(idx - 1); }
	prevBtn.addEventListener('click', prev);
	nextBtn.addEventListener('click', next);
	track.addEventListener('touchstart', handleTouchStart, {passive:true});
	track.addEventListener('touchend', handleTouchEnd, {passive:true});
	let startX = 0;
	function handleTouchStart(e) { startX = e.changedTouches[0].clientX; }
	function handleTouchEnd(e) {
		const dx = e.changedTouches[0].clientX - startX;
		if (dx > 40) prev();
		else if (dx < -40) next();
	}
	function autoSlide() {
		interval = setInterval(next, 3400);
	}
	carousel.addEventListener('mouseenter', () => clearInterval(interval));
	carousel.addEventListener('mouseleave', autoSlide);
	autoSlide();
	show(0);
});

// =================== SERVICES CARD ANIMATIONS ===================
document.querySelectorAll('.service-card').forEach(card => {
	card.addEventListener('mouseenter', () => {
		card.classList.add('hovered');
	});
	card.addEventListener('mouseleave', () => {
		card.classList.remove('hovered');
	});
});

// =================== APPROACH STEPS ANIMATION ===================
const approachSteps = document.querySelectorAll('.approach-step');
let approachAnimated = false;
function animateApproachSteps() {
	if (approachAnimated) return;
	const section = document.getElementById('approach');
	if (section && section.getBoundingClientRect().top < window.innerHeight - 80) {
		approachSteps.forEach((step, i) => {
			setTimeout(() => step.style.opacity = 1, 120 + i * 140);
		});
		approachAnimated = true;
	}
}
window.addEventListener('scroll', animateApproachSteps);
window.addEventListener('DOMContentLoaded', animateApproachSteps);

// =================== CONTACT FORM ===================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
	contactForm.addEventListener('submit', e => {
		e.preventDefault();
		// Simple validation
		let valid = true;
		contactForm.querySelectorAll('input, select, textarea').forEach(input => {
			if (!input.checkValidity()) {
				input.classList.add('invalid');
				valid = false;
			} else {
				input.classList.remove('invalid');
			}
		});
		if (!valid) return;
		// Success animation
		const success = contactForm.querySelector('.form-success');
		success.hidden = false;
		success.setAttribute('visible', '');
		contactForm.reset();
		setTimeout(() => {
			success.hidden = true;
			success.removeAttribute('visible');
		}, 3200);
	});
	contactForm.querySelectorAll('input, select, textarea').forEach(input => {
		input.addEventListener('focus', () => {
			input.classList.add('focused');
		});
		input.addEventListener('blur', () => {
			input.classList.remove('focused');
		});
	});
}

// =================== FLOATING PHONE BUTTON ===================
const phoneFloat = document.querySelector('.phone-float');
if (phoneFloat) {
	setInterval(() => {
		phoneFloat.classList.add('pulse');
		setTimeout(() => phoneFloat.classList.remove('pulse'), 600);
	}, 4600);
}

// =================== CAPABILITIES CARD ANIMATION ===================
document.addEventListener('DOMContentLoaded', function () {
  var cards = document.querySelectorAll('.capability-card[data-anim]');
  if (!('IntersectionObserver' in window) || !cards.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var idx = Array.from(cards).indexOf(entry.target);
        setTimeout(function() {
          entry.target.classList.add('in-view');
        }, idx * 160);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  cards.forEach(function(card) { observer.observe(card); });
});
