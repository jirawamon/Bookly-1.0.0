/**
 * Project: Book Store E-commerce
 * Role: Full Stack Developer (Frontend Logic)
 * Description: รวมระบบ UI (Search, Swiper, Timer) และระบบ Dynamic Product Rendering
 */

(function($) {
    "use strict";

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
            const products = Array.isArray(data?.products) ? data.products : [];
            renderUI(products);
        })
        .catch((err) => console.error("Data Flow Error:", err));
    }

    // ขั้นตอนที่ 3: แสดงผลบนหน้าเว็บ
    function renderUI(products) {
        console.log("Sequence: 3. renderUI() building HTML for", products.length, "items.");
        const container = document.getElementById('product-container');
        if (!container) return;

        let html = '';
        products.forEach((product) => {
            let stars = '';
            for (let i = 0; i < (product.rating || 0); i++) {
                stars += `<svg class="star star-fill"><use xlink:href="#star-fill"></use></svg>`;
            }
            const hasDiscount = Number(product.original_price) > Number(product.sale_price);

            html += `
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
                    </div>
                </div>`;
        });
        container.innerHTML = html;
        console.log("Sequence Complete: UI Rendered.");
    }

    // --- [3] ส่วนเริ่มต้นการทำงาน (Initializers) ---

    $(document).ready(function() {
        // รันฟังก์ชัน UI เดิม
        searchPopup();
        initProductQty();
        countdownTimer();

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