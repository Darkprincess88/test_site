/* ============================================================
   «Планета лета» — клиентский скрипт
   1. Бургер-меню (открытие, focus trap, блокировка скролла)
   2. Валидация формы заявки
   3. Актуальный год в футере
   ============================================================ */
(function () {
    'use strict';

    /* ===== 1. Бургер-меню ===== */
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const desktopMedia = window.matchMedia('(min-width: 768px)');

    if (burger && nav) {
        var FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

        function isMobile() {
            return !desktopMedia.matches;
        }

        function toggleMenu(forceState) {
            var isOpen = typeof forceState === 'boolean'
                ? forceState
                : !nav.classList.contains('is-open');

            nav.classList.toggle('is-open', isOpen);
            burger.classList.toggle('is-active', isOpen);
            burger.setAttribute('aria-expanded', String(isOpen));
            burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');

            // Блокируем прокрутку страницы, пока открыто мобильное меню
            document.body.classList.toggle('no-scroll', isOpen && isMobile());
        }

        // Открытие/закрытие по бургеру
        burger.addEventListener('click', function () {
            toggleMenu();
        });

        // Закрытие меню при клике на любую навигационную ссылку
        nav.addEventListener('click', function (event) {
            var link = event.target.closest('a');
            if (link) {
                toggleMenu(false);
            }
        });

        // Закрытие меню по клику вне его области
        document.addEventListener('click', function (event) {
            if (!nav.classList.contains('is-open')) return;
            if (nav.contains(event.target) || burger.contains(event.target)) return;
            toggleMenu(false);
        });

        // Esc — закрыть; Tab — focus trap внутри меню
        document.addEventListener('keydown', function (event) {
            if (!nav.classList.contains('is-open')) return;

            if (event.key === 'Escape') {
                toggleMenu(false);
                burger.focus();
                return;
            }

            if (event.key === 'Tab') {
                var focusable = Array.prototype.filter.call(
                    nav.querySelectorAll(FOCUSABLE_SELECTOR),
                    function (el) { return el.offsetParent !== null; }
                );
                var sequence = [burger].concat(focusable);
                var first = sequence[0];
                var last = sequence[sequence.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        // Если окно расширили до десктопа — принудительно закрываем мобильное меню
        function onMediaChange() {
            if (desktopMedia.matches && nav.classList.contains('is-open')) {
                toggleMenu(false);
            }
        }

        if (typeof desktopMedia.addEventListener === 'function') {
            desktopMedia.addEventListener('change', onMediaChange);
        } else if (typeof desktopMedia.addListener === 'function') {
            desktopMedia.addListener(onMediaChange); // fallback для старых браузеров
        }
    }

    /* ===== 2. Валидация формы заявки ===== */
    var form = document.getElementById('ticket-form');

    if (form) {
        var nameField = form.elements['name'];
        var phoneField = form.elements['phone'];
        var statusRegion = document.getElementById('form-status');

        var PHONE_PATTERN = /^\+?[\d\s()-]{10,18}$/;
        var DIGITS_PATTERN = /\d/g;

        function showError(field, message) {
            var error = document.getElementById(field.id + '-error');
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');
            if (error) error.textContent = message;
        }

        function clearError(field) {
            var error = document.getElementById(field.id + '-error');
            field.classList.remove('is-invalid');
            field.removeAttribute('aria-invalid');
            if (error) error.textContent = '';
        }

        function validateName() {
            if (!nameField.value.trim()) {
                showError(nameField, 'Пожалуйста, укажите ваше имя.');
                return false;
            }
            clearError(nameField);
            return true;
        }

        function validatePhone() {
            var value = phoneField.value.trim();
            var digits = value.match(DIGITS_PATTERN);

            if (!value) {
                showError(phoneField, 'Укажите телефон — мы перезвоним.');
                return false;
            }
            if (!PHONE_PATTERN.test(value) || !digits || digits.length < 10) {
                showError(phoneField, 'Телефон должен содержать минимум 10 цифр, например +7 (999) 123-45-67.');
                return false;
            }
            clearError(phoneField);
            return true;
        }

        // Ошибка исчезает, как только пользователь начинает исправлять поле
        nameField.addEventListener('input', function () { clearError(nameField); });
        phoneField.addEventListener('input', function () { clearError(phoneField); });

        form.addEventListener('submit', function (event) {
            event.preventDefault(); // бэкенда нет — имитируем обработку заявки

            var isNameValid = validateName();
            var isPhoneValid = validatePhone();

            if (!isNameValid || !isPhoneValid) {
                if (statusRegion) statusRegion.textContent = '';
                var firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            if (statusRegion) {
                statusRegion.textContent = '✅ Заявка отправлена! Мы перезвоним вам в течение часа.';
            }
            form.reset();
        });
    }

    /* ===== 3. Актуальный год в футере ===== */
    var yearEl = document.getElementById('footer-year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
})();
