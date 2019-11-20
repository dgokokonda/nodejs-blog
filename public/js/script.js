$(function() {
    $('.js-reg, .js-auth').click(function(e) {
        e.preventDefault();
        $('.box form').slideToggle(500);
    });
});
