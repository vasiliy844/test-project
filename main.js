/* =========================================================
   main.js — popup-форма, валидация, AJAX-отправка
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Ссылки на элементы ----------
    const modal       = document.getElementById('feedbackModal');
    const openBtn     = document.getElementById('openFormBtn');
    const form        = document.getElementById('feedbackForm');
    const nameInput   = document.getElementById('name');
    const emailInput  = document.getElementById('email');
    const nameError   = document.getElementById('nameError');
    const emailError  = document.getElementById('emailError');
    const formStatus  = document.getElementById('formStatus');

    /* ---------------------------------------------------------
       ОТКРЫТИЕ / ЗАКРЫТИЕ POPUP
       --------------------------------------------------------- */

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // блокируем скролл фона
        nameInput.focus();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        resetForm();
    }

    openBtn.addEventListener('click', openModal);

    // Закрытие: крестик и клик по оверлею (оба помечены data-close)
    modal.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', closeModal);
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    /* ---------------------------------------------------------
       СБРОС ФОРМЫ
       --------------------------------------------------------- */
    function resetForm() {
        form.reset();
        nameInput.classList.remove('is-invalid');
        emailInput.classList.remove('is-invalid');
        nameError.textContent  = '';
        emailError.textContent = '';
        formStatus.textContent = '';
        formStatus.className   = 'form__status';
    }

    /* ---------------------------------------------------------
       ВАЛИДАЦИЯ
       --------------------------------------------------------- */
    // Простая, но рабочая проверка e-mail
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateName(value) {
        const trimmed = value.trim();
        if (trimmed === '')   return 'Пожалуйста, введите имя.';
        if (trimmed.length < 2) return 'Имя должно содержать минимум 2 символа.';
        return '';
    }

    function validateEmail(value) {
        const trimmed = value.trim();
        if (trimmed === '')                     return 'Пожалуйста, введите e-mail.';
        if (!EMAIL_REGEX.test(trimmed))         return 'Введите корректный e-mail.';
        return '';
    }

    function showError(input, errorEl, message) {
        errorEl.textContent = message;
        input.classList.toggle('is-invalid', Boolean(message));
    }

    // Живая валидация — ошибка исчезает, как только пользователь исправил поле
    nameInput.addEventListener('input', () => {
        showError(nameInput, nameError, validateName(nameInput.value));
    });

    emailInput.addEventListener('input', () => {
        showError(emailInput, emailError, validateEmail(emailInput.value));
    });

    /* ---------------------------------------------------------
       ОТПРАВКА ФОРМЫ (Fetch API + JSON)
       --------------------------------------------------------- */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Клиентская проверка
        const nameMsg  = validateName(nameInput.value);
        const emailMsg = validateEmail(emailInput.value);

        showError(nameInput,  nameError,  nameMsg);
        showError(emailInput, emailError, emailMsg);

        if (nameMsg || emailMsg) {
            formStatus.textContent = 'Пожалуйста, исправьте ошибки в форме.';
            formStatus.className   = 'form__status is-error';
            return;
        }

        // 2. Отправка на сервер
        formStatus.textContent = 'Отправка...';
        formStatus.className   = 'form__status';

        try {
            const response = await fetch('index.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:  nameInput.value.trim(),
                    email: emailInput.value.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                formStatus.textContent = data.message;
                formStatus.className   = 'form__status is-success';
                form.reset();

                // Автоматически закрываем popup через 2 секунды
                setTimeout(closeModal, 2000);
            } else {
                formStatus.textContent = data.message || 'Произошла ошибка.';
                formStatus.className   = 'form__status is-error';
            }
        } catch (err) {
            console.error('Ошибка отправки:', err);
            formStatus.textContent = 'Не удалось отправить данные. Попробуйте позже.';
            formStatus.className   = 'form__status is-error';
        }
    });
});