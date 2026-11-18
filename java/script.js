document.addEventListener("DOMContentLoaded", () => {
    // debug: confirm script executed and gsap is available
    console.log('[script.js] DOMContentLoaded fired');
    console.log('[script.js] gsap available?', typeof gsap !== 'undefined');

    // Note: GSAP is loaded via a script tag in the HTML (global `gsap`).

    const container = document.querySelector(".container");
    const menuToggle = document.querySelector(".menu-toggle");
    const menuOverlay = document.querySelector(".menu-overlay");
    const menuContent = document.querySelector(".menu-content");
    const menuPreviewImg = document.querySelector(".menu-preview-img");
    const menuLinks = document.querySelectorAll(".link a");
    const menuBg = document.querySelector('.menu-bg');
    const pageOverlay = document.querySelector('.page-overlay');
    const pageBg = document.querySelector('.page-bg');
    const pagePanels = document.querySelectorAll('.page-panel');
    const pageBack = document.querySelector('.page-back');
    const pageTitle = document.querySelector('.page-title');
    const toast = document.getElementById('toast');

    let isOpen = false;
    let isAnimating = false;
    let pageOpen = false;
    let toastTimer = null;

    // single source of truth for the default preview image
    const DEFAULT_PREVIEW_SRC = "img2/cost.jpg";

    menuToggle.addEventListener("click", () => {
        console.log('[script.js] menuToggle clicked, isOpen=', isOpen, 'isAnimating=', isAnimating);
        if (!isOpen) openMenu();
        else closeMenu();
    });

    // 第一段代码
    function resetPreviewImage() {
        menuPreviewImg.innerHTML = "";
        const defaultPreviewImg = document.createElement("img");
        defaultPreviewImg.src = DEFAULT_PREVIEW_SRC;
        menuPreviewImg.appendChild(defaultPreviewImg);
        // reset background container to a single default image element
        if (menuBg) {
            menuBg.innerHTML = '';
            const bgImg = document.createElement('img');
            bgImg.src = DEFAULT_PREVIEW_SRC;
            bgImg.style.opacity = '1';
            menuBg.appendChild(bgImg);
        }
    }

    // 第二段代码
    function cleanupPreviewImages() {
        const previewImages = menuPreviewImg.querySelectorAll("img");
        if (previewImages.length > 3) {
            for (let i = 0; i < previewImages.length - 3; i++) {
                menuPreviewImg.removeChild(previewImages[i]);
            }
        }
    }

    // cleanup background images keeping last 3
    function cleanupBgImages() {
        if (!menuBg) return;
        const imgs = menuBg.querySelectorAll('img');
        if (imgs.length > 3) {
            for (let i = 0; i < imgs.length - 3; i++) {
                menuBg.removeChild(imgs[i]);
            }
        }
    }

    // 第三段代码
    function animateMenuToggle(isOpening) {
        const open = document.querySelector("p#menu-open");
        const close = document.querySelector("p#menu-close");

        gsap.to(isOpening ? open : close, {
            x: isOpening ? -5 : 5,
            y: isOpening ? -10 : 10,
            rotation: isOpening ? -5 : 5,
            opacity: 0,
            delay: 0.25,
            duration: 0.5,
            ease: "power2.out",
        });

        gsap.to(isOpening ? close : open, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            delay: 0.5,
            duration: 0.5,
            ease: "power2.out",
        });

    }

    /*function openMenu() {
        if (isAnimating || isOpen) return;
        isAnimating = true;

        gsap.to(container, {
            rotation: 10,
            x: 300,
            y: 450,
            scale: 1.5,
            duration: 1.25,
            ease: "power4.inOut",
        });

        animateMenuToggle(true);
        gsap.to(menuOverlay, {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.25,
            ease: "power4.inOut",
        });

        gsap.to([".link a", ".social a"], {
            y: "0%",
            duration: 1,
            opacity: 1,
            delay: 0.75,
            stagger: 0.1,
            ease: "power3.out",
        })
        gsap.to(menuContent, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
            duration: 1.25,
            ease: "power4.inOut",
            onComplete: () => {
                isOpen = true;
                isAnimating = false;
            },
        })

    }
     */

    // 使用 GSAP timeline 来统一管理打开动画和状态，避免不同动画的 onComplete 导致状态不同步
    function openMenu() {
        if (isAnimating || isOpen) return;
        isAnimating = true;
        console.log('[script.js] openMenu called');

        animateMenuToggle(true);

        const tl = gsap.timeline({
            defaults: { ease: 'power4.inOut', duration: 1.25 },
            onComplete: () => {
                isOpen = true;
                isAnimating = false;
                console.log('[script.js] menu fully opened');
            }
        });

        // container move
        tl.to(container, { rotation: 10, x: 300, y: 450, scale: 1.5 }, 0);

        // overlay expand + make visible
        tl.to(menuOverlay, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', opacity: 1 }, 0);

        // ensure default bg is visible when opening
        if (menuBg) {
            menuBg.innerHTML = '';
            const bgImg = document.createElement('img');
            bgImg.src = DEFAULT_PREVIEW_SRC;
            bgImg.style.opacity = '1';
            menuBg.appendChild(bgImg);
        }

        // content bring in
        tl.to(menuContent, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', rotation: 0, x: 0, y: 0, scale: 1, opacity: 1 }, 0);

        // links stagger (start slightly later)
        tl.to([".link a", ".social a"], { y: '0%', duration: 1, opacity: 1, stagger: 0.1 }, 0.5);
    }

    function closeMenu() {
        if (isAnimating || !isOpen) return;
        isAnimating = true;

        console.log('[script.js] closeMenu called');

        animateMenuToggle(false);

        // 使用 timeline 统一关闭动画，确保状态在所有动画完成后只被重置一次
        console.log('[script.js] starting close timeline');
        const tl = gsap.timeline({
            defaults: { ease: 'power4.inOut', duration: 1.25 },
            onComplete: () => {
                isOpen = false;
                isAnimating = false;
                resetPreviewImage();
                console.log('[script.js] menu fully closed (timeline)');
            }
        });

        tl.to(container, { rotation: 0, x: 0, y: 0, scale: 1 }, 0);
        tl.to(menuContent, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', rotation: -15, x: -100, y: -100, scale: 1.5, opacity: 0.25 }, 0);
        tl.to(menuOverlay, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', opacity: 0 }, 0);

    }




    // ---------- content pages: self-introduce / project / honor ----------

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
    }

    // open a content page: the menu retreats, then the page rises from the bottom
    function openPage(name, imgSrc) {
        if (isAnimating || pageOpen || !isOpen) return;
        isAnimating = true;
        console.log('[script.js] openPage', name, imgSrc);

        // prepare the page: background image, title, active panel
        if (pageBg) {
            pageBg.innerHTML = '';
            const img = document.createElement('img');
            img.src = imgSrc;
            pageBg.appendChild(img);
        }
        pagePanels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.page === name);
        });
        if (pageTitle) pageTitle.textContent = name;
        pageOverlay.classList.add('is-open');
        pageOverlay.setAttribute('aria-hidden', 'false');

        const activePanel = pageOverlay.querySelector('.page-panel.active');

        const tl = gsap.timeline({
            defaults: { ease: 'power4.inOut', duration: 1.25 },
            onComplete: () => {
                pageOpen = true;
                isOpen = false;
                isAnimating = false;
                console.log('[script.js] page fully open');
            },
        });

        // 1. menu retreats while the page rises in the same breath:
        //    both wipes run with the same ease/duration, so every pixel is
        //    covered by either overlay and the homepage never shows through
        tl.to(menuContent, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', rotation: -15, x: -100, y: -100, scale: 1.5, opacity: 0.25 }, 0)
          .to(menuOverlay, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', opacity: 0 }, 0)
          .to(pageOverlay, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }, 0)

          // 2. background image settles behind the frost
          .fromTo(pageBg.querySelector('img'), { scale: 1.35, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out' }, 0.85)

          // 3. header + content stagger in
          .fromTo(pageOverlay.querySelectorAll('.page-header > *'), { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 1.25);

        if (activePanel) {
            tl.fromTo(activePanel.querySelectorAll('.reveal'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 1.3);
        }
    }

    // back: the page collapses upward and the menu rises back in
    function closePage() {
        if (isAnimating || !pageOpen) return;
        isAnimating = true;
        console.log('[script.js] closePage called');

        const tl = gsap.timeline({
            defaults: { ease: 'power4.inOut', duration: 1.25 },
            onComplete: () => {
                pageOpen = false;
                isOpen = true;
                isAnimating = false;
                pageOverlay.classList.remove('is-open');
                pageOverlay.setAttribute('aria-hidden', 'true');
                console.log('[script.js] page closed, back to menu');
            },
        });

        // page collapses upward while the menu expands back in the same
        // breath (complementary wipe, homepage stays hidden behind them)
        tl.to(pageOverlay, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }, 0)
          .to(pageOverlay.querySelectorAll('.page-header > *'), { y: -24, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
          .to(menuOverlay, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', opacity: 1 }, 0)
          .to(menuContent, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', rotation: 0, x: 0, y: 0, scale: 1, opacity: 1 }, 0);
    }

    // open a content page when a menu link is clicked
    menuLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (isAnimating || !isOpen) return;

            const page = link.getAttribute('data-page');
            const imgSrc = link.getAttribute('data-img');
            if (page && imgSrc) {
                openPage(page, imgSrc);
            } else {
                showToast('coming soon');
            }
        });
    });

    // back button returns to the menu
    if (pageBack) {
        pageBack.addEventListener('click', (event) => {
            event.preventDefault();
            closePage();
        });
    }

    // 第二段代码
    menuLinks.forEach((link) => {
        link.addEventListener("mouseover", () => {
            if (!isOpen || isAnimating) return;

            const imgSrc = link.getAttribute("data-img");
            if (!imgSrc) return;

            // resolve to the absolute URL the browser stores in img.src,
            // otherwise endsWith() never matches (relative vs absolute paths)
            const resolvedSrc = new URL(imgSrc, document.baseURI).href;

            // handle small preview image as before
            const previewImages = menuPreviewImg.querySelectorAll("img");
            if (
                previewImages.length > 0 &&
                previewImages[previewImages.length - 1].src === resolvedSrc
            )
                return;

            const newPreviewImg = document.createElement("img");
            newPreviewImg.src = imgSrc;
            newPreviewImg.style.opacity = "0";
            newPreviewImg.style.transform = "scale(1.25) rotate(10deg)";

            menuPreviewImg.appendChild(newPreviewImg);
            cleanupPreviewImages();

            gsap.to(newPreviewImg, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.75,
                ease: "power2.out",
            });

            // create a full-size background image element and animate it like the small preview
            if (menuBg) {
                const newBgImg = document.createElement('img');
                newBgImg.src = imgSrc;
                newBgImg.style.opacity = '0';
                newBgImg.style.transform = 'scale(1.25) rotate(10deg)';
                menuBg.appendChild(newBgImg);
                cleanupBgImages();
                gsap.to(newBgImg, {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.75,
                    ease: 'power2.out',
                });
            }
        });
    });

    // when leaving the menu area, you can optionally fade background back to default
    if (menuOverlay) {
        menuOverlay.addEventListener('mouseleave', () => {
            if (!menuBg) return;
            // fade back to the default background image
            const bgImg = document.createElement('img');
            bgImg.src = DEFAULT_PREVIEW_SRC;
            bgImg.style.opacity = '0';
            menuBg.appendChild(bgImg);
            cleanupBgImages();
            gsap.to(bgImg, { opacity: 1, duration: 0.35 });
        });
    }
});