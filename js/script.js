/**
 * Project: Book Store E-commerce
 * Role: Full Stack Developer (Frontend Logic)
 * Description: รวมระบบ UI (Search, Swiper, Timer) และระบบ Dynamic Product Rendering
 */

(function($) {
    "use strict";

    let allProducts = [];
    let activeRatingFilter = "all";
    let activeSearchQuery = "";
    let cartStorage = [];

    // Cart Management Functions
    function getCartTotal() {
        return cartStorage.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            return sum + (Number(item.price) || 0) * quantity;
        }, 0).toFixed(2);
    }

    function updateCartUI() {
        const countBadge = document.querySelector('.cart-count-badge');
        const countDisplay = document.querySelector('.cart-count-display');
        const cartList = document.querySelector('.cart-storage');

        const totalQuantity = cartStorage.reduce((sum, item) => sum + (item.quantity || 1), 0);

        if (countBadge) {
            countBadge.textContent = cartStorage.length;
        }
        if (countDisplay) {
            const paddedCount = String(totalQuantity).padStart(2, '0');
            countDisplay.textContent = `(${paddedCount})`;
        }

        if (cartList) {
            let cartHTML = '';
            cartStorage.forEach((item, index) => {
                const quantity = item.quantity || 1;
                const itemTotal = (Number(item.price) * quantity).toFixed(2);
                cartHTML += `
                    <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center lh-sm cart-item" data-cart-index="${index}">
                        <div style="flex: 1;">
                            <h5 style="margin-bottom: 0.25rem;"><a href="#">${item.title}</a></h5>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-outline-secondary btn-sm px-2 py-0 btn-decrease-qty" data-cart-index="${index}" style="font-size: 0.75rem; padding: 0.125rem 0.375rem !important;">−</button>
                                <small style="min-width: 30px; text-align: center;">Qty: ${quantity}</small>
                                <button type="button" class="btn btn-outline-secondary btn-sm px-2 py-0 btn-increase-qty" data-cart-index="${index}" style="font-size: 0.75rem; padding: 0.125rem 0.375rem !important;">+</button>
                            </div>
                        </div>
                        <div class="d-flex flex-column align-items-end gap-1">
                            <span class="text-primary fw-bold">$${itemTotal}</span>
                            <button type="button" class="btn btn-xs btn-outline-danger btn-remove-from-cart" data-cart-index="${index}" style="font-size: 0.65rem; padding: 0.125rem 0.5rem;">Remove</button>
                        </div>
                    </li>`;
            });
            cartHTML += `
                    <li class="list-group-item bg-transparent d-flex justify-content-between cart-total-row">
                        <span class="text-capitalize"><b>Total (USD)</b></span>
                        <strong class="cart-total-price">$${getCartTotal()}</strong>
                    </li>`;
            cartList.innerHTML = cartHTML;
        }
    }

    function addToCart(productId, title, price, image) {
        const existingItem = cartStorage.find((item) => Number(item.id) === Number(productId));
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            console.log("Item quantity updated:", existingItem);
        } else {
            const newItem = {
                id: productId,
                title: title,
                price: price,
                image: image,
                quantity: 1,
                addedAt: new Date().toISOString()
            };
            cartStorage.push(newItem);
            console.log("Item added to cart:", newItem);
        }
        updateCartUI();
    }

    function removeFromCart(cartIndex) {
        if (cartIndex >= 0 && cartIndex < cartStorage.length) {
            const removed = cartStorage.splice(cartIndex, 1);
            updateCartUI();
            console.log("Item removed from cart:", removed);
        }
    }

    // --- [1] ส่วนของ UI Components (โค้ดเดิมของคุณ) ---

    // ระบบ Search Popup
    var searchPopup = function() {
        $('#header-nav').on('click', '.search-button', function(e) {
            $('.search-popup').toggleClass('is-visible');
        });

        $('#header-nav').on('click', '.btn-close-search', function(e) {
            $('.search-popup').toggleClass('is-visible');
        });
        
        $(".search-popup-trigger").on("click", function(b) {
            b.preventDefault();
            $(".search-popup").addClass("is-visible");
            setTimeout(function() {
                $(".search-popup").find("#search-popup").focus();
            }, 350);
        });

        $(".search-popup").on("click", function(b) {
            if ($(b.target).is(".search-popup-close") || $(b.target).is(".search-popup-close svg") || $(b.target).is(".search-popup-close path") || $(b.target).is(".search-popup")) {
                b.preventDefault();
                $(this).removeClass("is-visible");
            }
        });

        $(document).keyup(function(b) {
            if (b.which === 27) $(".search-popup").removeClass("is-visible");
        });
    }

    // ระบบ Countdown Timer
    var countdownTimer = function() {
        function getTimeRemaining(endtime) {
            const total = Date.parse(endtime) - Date.parse(new Date());
            const seconds = Math.floor((total / 1000) % 60);
            const minutes = Math.floor((total / 1000 / 60) % 60);
            const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
            const days = Math.floor(total / (1000 * 60 * 60 * 24));
            return { total, days, hours, minutes, seconds };
        }

        function initializeClock(id, endtime) {
            const clock = document.getElementById(id);
            if (!clock) return;
            const daysSpan = clock.querySelector('.days');
            const hoursSpan = clock.querySelector('.hours');
            const minutesSpan = clock.querySelector('.minutes');
            const secondsSpan = clock.querySelector('.seconds');

            function updateClock() {
                const t = getTimeRemaining(endtime);
                if(daysSpan) daysSpan.innerHTML = t.days;
                if(hoursSpan) hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
                if(minutesSpan) minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
                if(secondsSpan) secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
                if (t.total <= 0) clearInterval(timeinterval);
            }
            updateClock();
            const timeinterval = setInterval(updateClock, 1000);
        }

        $('#countdown-clock').each(function(){
            const deadline = new Date(Date.parse(new Date()) + 28 * 24 * 60 * 60 * 1000);
            initializeClock('countdown-clock', deadline);
        });
    }

    // ระบบ Quantity (บวก/ลบ จำนวนสินค้า)
    var initProductQty = function(){
        $('.product-qty').each(function(){
            var $el_product = $(this);
            $el_product.find('.quantity-right-plus').click(function(e){
                e.preventDefault();
                var quantity = parseInt($el_product.find('#quantity').val());
                $el_product.find('#quantity').val(quantity + 1);
            });
            $el_product.find('.quantity-left-minus').click(function(e){
                e.preventDefault();
                var quantity = parseInt($el_product.find('#quantity').val());
                if(quantity > 0) $el_product.find('#quantity').val(quantity - 1);
            });
        });
    }

    // --- [2] ส่วนของระบบข้อมูล (Sequence: Request -> Fetch -> Render) ---

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function levenshteinDistance(left, right) {
        const source = left || "";
        const target = right || "";

        if (!source.length) return target.length;
        if (!target.length) return source.length;

        const matrix = Array.from({ length: source.length + 1 }, (_, row) => [row]);

        for (let column = 1; column <= target.length; column += 1) {
            matrix[0][column] = column;
        }

        for (let row = 1; row <= source.length; row += 1) {
            for (let column = 1; column <= target.length; column += 1) {
                const substitutionCost = source[row - 1] === target[column - 1] ? 0 : 1;
                matrix[row][column] = Math.min(
                    matrix[row - 1][column] + 1,
                    matrix[row][column - 1] + 1,
                    matrix[row - 1][column - 1] + substitutionCost
                );
            }
        }

        return matrix[source.length][target.length];
    }

    function getRatingOptions(products) {
        return [...new Set(products.map((product) => Number(product.rating) || 0).filter(Boolean))].sort((left, right) => right - left);
    }

    function scoreProduct(product, query) {
        const title = normalizeText(product.title);
        const author = normalizeText(product.author);
        const combined = `${title} ${author}`.trim();
        const tokens = query.split(" ").filter(Boolean);

        if (!query) return 0;
        if (combined.includes(query)) return 100;

        let score = 0;
        tokens.forEach((token) => {
            if (combined.includes(token)) {
                score += 2;
            }
        });

        if (tokens.length) {
            const titleTokens = title.split(" ");
            const authorTokens = author.split(" ");
            tokens.forEach((token) => {
                if (titleTokens.some((word) => word.startsWith(token)) || authorTokens.some((word) => word.startsWith(token))) {
                    score += 1;
                }
            });
        }

        const distance = levenshteinDistance(query, combined);
        const similarity = 1 - (distance / Math.max(query.length, combined.length));

        return score + similarity;
    }

    function getVisibleProducts(products) {
        const normalizedQuery = normalizeText(activeSearchQuery);

        let visibleProducts = products.filter((product) => {
            if (activeRatingFilter === "all") return true;
            return String(Number(product.rating) || 0) === String(activeRatingFilter);
        });

        if (!normalizedQuery) {
            return visibleProducts;
        }

        const matchedProducts = visibleProducts
            .map((product) => ({
                ...product,
                __score: scoreProduct(product, normalizedQuery),
            }))
            .filter((product) => product.__score > 0.85)
            .sort((left, right) => right.__score - left.__score);

        return matchedProducts;
    }

    function renderRatingFilters(products) {
        const filterContainer = document.getElementById("rating-filters");
        if (!filterContainer) return;

        const ratings = getRatingOptions(products);
        const buttons = [
            `<button type="button" class="btn btn-outline-dark rating-filter-btn ${activeRatingFilter === "all" ? "active" : ""}" data-rating="all">All</button>`,
            ...ratings.map((rating) => {
                const label = rating === 1 ? "1 Star" : `${rating} Stars`;
                return `<button type="button" class="btn btn-outline-dark rating-filter-btn ${String(activeRatingFilter) === String(rating) ? "active" : ""}" data-rating="${rating}">${label}</button>`;
            }),
        ];

        filterContainer.innerHTML = buttons.join("");
    }

    function buildProductCard(product) {
        let stars = "";
        const rating = Number(product.rating) || 0;

        for (let i = 0; i < rating; i += 1) {
            stars += `<svg class="star star-fill"><use xlink:href="#star-fill"></use></svg>`;
        }

        const hasDiscount = Number(product.original_price) > Number(product.sale_price);

        return `
            <div class="col-12 col-sm-6 col-lg-3 mb-4">
                <div class="card position-relative p-4 border rounded-3 h-100">
                    ${hasDiscount ? '<div class="position-absolute"><p class="bg-primary py-1 px-3 fs-6 text-white rounded-2">Sale</p></div>' : ''}
                    <img src="${product.image}" class="img-fluid shadow-sm" alt="${product.title}">
                    <h6 class="mt-4 mb-0 fw-bold"><a href="${product.url}">${product.title}</a></h6>
                    <div class="review-content d-flex">
                        <p class="my-2 me-2 fs-6 text-black-50">${product.author}</p>
                        <div class="rating text-warning d-flex align-items-center">${stars}</div>
                    </div>
                    <span class="price text-primary fw-bold mb-2 fs-5">
                        <s class="text-black-50">$${product.original_price}</s> $${product.sale_price}
                    </span>
                    <div class="card-concern position-absolute start-0 end-0 d-flex gap-2">
                        <button type="button" class="btn btn-dark add-to-cart" data-product-id="${product.id}" data-product-title="${product.title}" data-product-price="${product.sale_price}" data-product-image="${product.image}">
                            <svg class="cart"><use xlink:href="#cart"></use></svg>
                        </button>
                        <a href="#" class="btn btn-dark">
                            <span><svg class="wishlist"><use xlink:href="#heart"></use></svg></span>
                        </a>
                    </div>
                </div>
            </div>`;
    }

    function renderUI(products) {
        console.log("Sequence: 3. renderUI() building HTML for", products.length, "items.");
        const container = document.getElementById('product-container');
        const message = document.getElementById('search-result-message');
        if (!container) return;

        renderRatingFilters(products);

        const visibleProducts = getVisibleProducts(products);
        const hasSearchQuery = Boolean(normalizeText(activeSearchQuery));

        if (message) {
            if (hasSearchQuery) {
                message.innerHTML = visibleProducts.length
                    ? `<div class="alert alert-light border mb-0">Showing ${visibleProducts.length} result(s) for <strong>${activeSearchQuery}</strong>.</div>`
                    : '<div class="search-empty-state">Not found</div>';
            } else {
                message.innerHTML = '';
            }
        }

        if (!visibleProducts.length) {
            container.innerHTML = '';
            return;
        }

        const ratingGroups = getRatingOptions(visibleProducts);
        let html = '';

        ratingGroups.forEach((rating) => {
            const ratingProducts = visibleProducts.filter((product) => Number(product.rating) === rating);
            if (!ratingProducts.length) return;

            html += `
                <div class="col-12 mb-2">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h4 class="mb-0 catalog-group-title">${rating === 1 ? '1 Star' : `${rating} Stars`} category</h4>
                        <span class="badge bg-primary rounded-pill">${ratingProducts.length}</span>
                    </div>
                </div>`;

            ratingProducts.forEach((product) => {
                html += buildProductCard(product);
            });
        });

        container.innerHTML = html;
        console.log("Sequence Complete: UI Rendered.");
    }

    // ขั้นตอนที่ 1: สั่งการดึงข้อมูล
    window.requestProducts = function() {
        console.log("Sequence: 1. requestProducts() started.");
        const jsonCandidates = ['products.json', 'project.json'];
        fetchProducts(jsonCandidates);
    }

    // ขั้นตอนที่ 2: ดึงไฟล์จาก Server/Local
    function fetchProducts(paths) {
        console.log("Sequence: 2. fetchProducts() initiating...");
        paths.reduce((promise, fileName) => {
            return promise.catch(() => {
                return fetch(fileName).then((response) => {
                    if (!response.ok) throw new Error(`Failed to load ${fileName}`);
                    return response.json();
                });
            });
        }, Promise.reject())
        .then((data) => {
            allProducts = Array.isArray(data?.products) ? data.products : [];
            renderUI(allProducts);
        })
        .catch((err) => console.error("Data Flow Error:", err));
    }

    // --- [3] ส่วนเริ่มต้นการทำงาน (Initializers) ---

    $(document).ready(function() {
        // รันฟังก์ชัน UI เดิม
        searchPopup();
        initProductQty();
        countdownTimer();

        $(document).on('click', '.add-to-cart', function(e) {
            e.preventDefault();
            const productId = $(this).data('product-id');
            const productTitle = $(this).data('product-title');
            const productPrice = $(this).data('product-price');
            const productImage = $(this).data('product-image');
            addToCart(productId, productTitle, productPrice, productImage);
        });

        $(document).on('click', '.btn-remove-from-cart', function(e) {
            e.preventDefault();
            const cartIndex = $(this).data('cart-index');
            removeFromCart(cartIndex);
        });

        $(document).on('click', '.btn-increase-qty', function(e) {
            e.preventDefault();
            const cartIndex = $(this).data('cart-index');
            if (cartIndex >= 0 && cartIndex < cartStorage.length) {
                cartStorage[cartIndex].quantity = (cartStorage[cartIndex].quantity || 1) + 1;
                updateCartUI();
                console.log("Quantity increased for item at index:", cartIndex);
            }
        });

        $(document).on('click', '.btn-decrease-qty', function(e) {
            e.preventDefault();
            const cartIndex = $(this).data('cart-index');
            if (cartIndex >= 0 && cartIndex < cartStorage.length) {
                const currentQty = cartStorage[cartIndex].quantity || 1;
                if (currentQty > 1) {
                    cartStorage[cartIndex].quantity = currentQty - 1;
                } else {
                    removeFromCart(cartIndex);
                }
                updateCartUI();
                console.log("Quantity decreased for item at index:", cartIndex);
            }
        });

        $(document).on('submit', '.search-form', function(e) {
            e.preventDefault();
            activeSearchQuery = String($('#search-form').val() || '').trim();
            $('.search-popup').removeClass('is-visible');
            renderUI(allProducts);
        });

        $('#rating-filters').on('click', '.rating-filter-btn', function() {
            activeRatingFilter = $(this).data('rating');
            renderUI(allProducts);
        });

        // รัน Swiper
        new Swiper(".main-swiper", {
            speed: 500,
            navigation: { nextEl: ".main-slider-button-next", prevEl: ".main-slider-button-prev" },
        });

        new Swiper(".product-swiper", {
            spaceBetween: 20,
            navigation: { nextEl: ".product-slider-button-next", prevEl: ".product-slider-button-prev" },
            breakpoints: { 0: { slidesPerView: 1 }, 660: { slidesPerView: 3 }, 980: { slidesPerView: 4 }, 1500: { slidesPerView: 5 } }
        });

        // เริ่มดึงข้อมูลสินค้ามาแสดงผล
        requestProducts();

        // Initialize cart UI
        updateCartUI();

        /* Video Modal Logic */
        var $videoSrc;  
        $('.play-btn').click(function() { $videoSrc = $(this).data("src"); });
        $('#myModal').on('shown.bs.modal', function () {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0"); 
        });
        $('#myModal').on('hide.bs.modal', function () { $("#video").attr('src', $videoSrc); });

    });

    window.addEventListener("load", function () {
        const preloader = document.getElementById("preloader");
        if(preloader) preloader.classList.add("hide-preloader");
    });

})(jQuery);