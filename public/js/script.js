$(function () {
    function resetForms() {
        $('.box form input').val('').removeClass('error');
        $('.box form p').remove();
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
            if (!data.ok) {
                $('form[name="reg"] h2').after('<p class="error">' + data.error + '</p>');
                if (data.fields) {
                    data.fields.forEach(function (item) {
                        $('form[name="reg"] input[name=' + item + ']').addClass('error');
                    });
                }
            } else {
                $('form[name="reg"] p').remove();
            }
        });
    });
});
