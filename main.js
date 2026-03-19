        document.addEventListener('DOMContentLoaded', () => {

            const navbar = document.getElementById('navbar');
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            });

            const hamburger = document.getElementById('hamburger');
            const closeMenu = document.getElementById('close-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileLinks = document.querySelectorAll('.mobile-link');

            hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
            closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => mobileMenu.classList.remove('open'));
            });

            const counters = document.querySelectorAll('.stat-num, .banner-stat');
            const fadeElements = document.querySelectorAll('.fade-in');
            const satisfactionBar = document.getElementById('progress-bar');
            const whyUsSection = document.getElementById('why-us');

            const animateCounter = (el) => {
                const target = +el.getAttribute('data-target');
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        el.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.innerText = target;
                    }
                };
                updateCounter();
            };

            const observerOptions = {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {

                        if (entry.target.classList.contains('fade-in')) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }

                        if (entry.target.id === 'why-us') {
                            if(satisfactionBar) {
                                setTimeout(()=> {
                                    satisfactionBar.style.width = '98%';
                                }, 300);
                            }
                        }
                    }
                });
            }, observerOptions);

            fadeElements.forEach(el => observer.observe(el));
            if(whyUsSection) observer.observe(whyUsSection);

            const counterObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if(entry.isIntersecting) {
                        animateCounter(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => counterObserver.observe(counter));

            const mapContainer = document.getElementById('world-map-container');
            if (mapContainer) {
                const mapObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !mapContainer.classList.contains('rendered')) {
                            mapContainer.classList.add('rendered');
                            renderMap();
                        }
                    });
                }, { threshold: 0.3 });
                mapObserver.observe(mapContainer);
            }

            function renderMap() {
                const dotsContainer = document.getElementById('map-dots');
                const svg = document.getElementById('map-svg');

                const hq = { x: 66.5, y: 37, type: 'hq' };
                const clients = [
                    { x: 77.5, y: 41.5 }, 
                    { x: 67, y: 33 },     
                    { x: 67, y: 41.5 }    
                ];

                [hq, ...clients].forEach((point, i) => {
                    const dot = document.createElement('div');
                    dot.className = `map-dot ${point.type === 'hq' ? 'hq' : ''}`;
                    dot.style.left = `${point.x}%`;
                    dot.style.top = `${point.y}%`;
                    dot.style.animationDelay = `${i * 0.2}s`;
                    dotsContainer.appendChild(dot);
                });
            }
        });