        document.addEventListener('DOMContentLoaded', () => {

            const navbar = document.getElementById('navbar');
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            });

            const hamburger = document.getElementById('hamburger');
            const closeMenu = document.getElementById('close-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileLinks = document.querySelectorAll('.mobile-link');

            hamburger.addEventListener('click', () => { mobileMenu.classList.add('open'); mobileMenu.style.pointerEvents = 'auto'; });
            closeMenu.addEventListener('click', () => { mobileMenu.classList.remove('open'); mobileMenu.style.pointerEvents = 'none'; });
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => { mobileMenu.classList.remove('open'); mobileMenu.style.pointerEvents = 'none'; });
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

            const addEmbedBtn = document.getElementById('add-embed-btn');
            const embedModal = document.getElementById('embed-modal');
            const embedModalCard = document.getElementById('embed-modal-card');
            const embedContainer = document.getElementById('embed-container');

            if (addEmbedBtn) {
                addEmbedBtn.addEventListener('click', () => {
                    openEmbedModal();
                });
            }

            window.openEmbedModal = function() {
                if (!embedModal) return;
                document.body.style.overflow = 'hidden';
                embedModal.style.opacity = '1';
                embedModal.style.pointerEvents = 'auto';
                embedModal.style.backdropFilter = 'blur(6px)';
                requestAnimationFrame(() => {
                    embedModalCard.style.transform = 'scale(1) translateY(0)';
                    embedModalCard.style.opacity = '1';
                });
            };

            window.closeEmbedModal = function() {
                if (!embedModal) return;
                embedModal.style.opacity = '0';
                embedModal.style.backdropFilter = 'blur(0px)';
                embedModalCard.style.transform = 'scale(.88) translateY(24px)';
                embedModalCard.style.opacity = '0';
                setTimeout(() => { embedModal.style.pointerEvents = 'none'; }, 320);
                document.body.style.overflow = '';
            };

            window.addEmbed = function() {
                const type = document.getElementById('embed-type').value;
                const title = document.getElementById('embed-title').value.trim();
                const url = document.getElementById('embed-url').value.trim();

                if (!title || !url) return;

                const card = document.createElement('div');
                card.className = 'embed-card relative fade-in';

                let preview = '';
                if (type === 'image') {
                    preview = '<div class="embed-preview"><img src="' + url + '" alt="' + title + '" onerror="this.parentElement.innerHTML=\'<i class=&quot;fa-solid fa-image text-4xl text-muted/30&quot;></i>\'"></div>';
                } else if (type === 'video') {
                    let embedUrl = url;
                    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                    if (ytMatch) {
                        embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
                    }
                    preview = '<div class="embed-preview"><iframe src="' + embedUrl + '" allowfullscreen loading="lazy"></iframe></div>';
                } else {
                    preview = '<div class="embed-preview"><a href="' + url + '" target="_blank" rel="noopener" class="flex flex-col items-center gap-2 text-muted hover:text-[#0066B3] transition-colors"><i class="fa-solid fa-file-arrow-down text-4xl"></i><span class="text-sm font-medium">Open File</span></a></div>';
                }

                card.innerHTML = preview +
                    '<div class="embed-info"><h4 class="font-heading text-sm font-bold text-[#1d235c]">' + title + '</h4>' +
                    '<span class="text-xs text-muted capitalize">' + type + '</span></div>' +
                    '<button class="embed-remove" onclick="this.parentElement.remove()" title="Remove">&#10005;</button>';

                embedContainer.appendChild(card);
                requestAnimationFrame(() => card.classList.add('visible'));

                document.getElementById('embed-title').value = '';
                document.getElementById('embed-url').value = '';
                closeEmbedModal();
            };
        });