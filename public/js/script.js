$(function () {
    function resetForms() {
        $('.box form input').val('').removeClass('error');
        $('.box form p').remove();
    }

    function validateForm(data) {
        const form = $(this).closest('form');

        if (!data.ok) {
            form.find('h2').after('<p class="error">' + data.error + '</p>');
            if (data.fields) {
                data.fields.forEach(function (item) {
                    form.find('input[name=' + item + ']').addClass('error');
                });
            }
        } else {
            form.find('p').remove();
            resetForms();
        }
    }

    $('.js-reg, .js-auth').click(function (e) {
        e.preventDefault();
        $('.box form').slideToggle(500);
        resetForms();
    });

    // clear
    $('input').on('focus', function () {
        $('p.error').remove();
        $('input').removeClass('error');
    });

    // register
    $('.js-confirm-reg').on('click', function (e) {
        e.preventDefault();

        var el = this;
        var data = {
            login: $('#reg-login').val(),
            password: $('#reg-pass').val(),
            passwordConfirm: $('#reg-pass-confirm').val()
        };

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/ajax/register'
        }).done(function (data) {
            validateForm.call(el, data);
        });
    });

    // authorization
    $('.js-confirm-auth').on('click', function (e) {
        e.preventDefault();

        var el = this;
        var data = {
            login: $('#auth-login').val(),
            password: $('#auth-pass').val()
        };

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/ajax/auth',
        }).done(function (data) {
            validateForm.call(el, data);
        });
    });
});
