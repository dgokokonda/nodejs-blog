$(function() {
  function resetForms(form, reset) {
    form.find("input.error, textarea.error, div.error").removeClass("error");
    form.children("p.error").remove();

    if (reset) {
      form.find("input.error, textarea.error").val("");
      form.find("div.error").html("");
    }
  }

  function validateForm(data) {
    const form = $(this).closest("form");

    if (!data.ok) {
      if (!form.children("p").length && data.error) {
        const fTitle = form.find("h2");

        if (fTitle.length) {
          fTitle.after('<p class="error">' + data.error + "</p>");
        } else {
          form
            .children()
            .eq(0)
            .before('<p class="error">' + data.error + "</p>");
        }
      }

      if (data.fields) {
        data.fields.forEach(function(item) {
          form.find("#" + item).addClass("error");
        });
      }
    } else {
      form.children("p").remove();
      resetForms(form);
    }
    return data.ok;
  }

  $(".js-reg, .js-auth").click(function(e) {
    e.preventDefault();
    $(".box form").slideToggle(500);
    resetForms($(".box form"));
  });

  // clear
  $("input").on("focus", function() {
    resetForms($(this).closest("form"), false);
  });

  $(".form-group").on("click", function() {
    resetForms($(this).closest("form"), false);
  });

  // register
  $(".js-confirm-reg").on("click", function(e) {
    e.preventDefault();

    var el = this;
    var data = {
      login: $("#reg-login").val(),
      password: $("#reg-pass").val(),
      passwordConfirm: $("#reg-pass-confirm").val()
    };

    $.ajax({
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      url: "/ajax/register"
    }).done(function(data) {
      const success = validateForm.call(el, data);

      if (success) {
        $(location).attr("href", "/");
      }
    });
  });

  // authorization
  $(".js-confirm-auth").on("click", function(e) {
    e.preventDefault();

    var el = this;
    var data = {
      login: $("#auth-login").val(),
      password: $("#auth-pass").val()
    };

    $.ajax({
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      url: "/ajax/login"
    }).done(function(data) {
      const success = validateForm.call(el, data);

      if (success) {
        $(location).attr("href", "/");
      }
    });
  });

  // MediumEditor
  const editor = new MediumEditor("#post-body", {
    placeholder: {
      text: "",
      hideOnClick: true
    }
  });

  $(".box form input").on("keydown", function(e) {
    if (e.key == "Enter") {
      $(this)
        .closest("form")
        .find(".btns button:last-child")
        .trigger("click");
      e.preventDefault();
    }
  });

  // save to draft
  $(".js-save-post").on("click", function(e) {
    e.preventDefault();
    var self = this;
    var data = {
      title: $("#post-title").val(),
      body: $("#post-body").text(),
      htmlData: $("#post-body").html()
    };

    $.ajax({
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      url: "/post/save"
    }).done(function(data) {
      const success = validateForm.call(self, data);
    });
  });
  // publish post
  $(".js-publish-post").on("click", function(e) {
    e.preventDefault();
    var self = this;
    var data = {
      title: $("#post-title").val(),
      body: $("#post-body").text(),
      htmlData: $("#post-body").html()
    };

    $.ajax({
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      url: "/post/publish"
    }).done(function(data) {
      const success = validateForm.call(self, data);
      if (success) {
        $(location).attr("href", "/");
      }
    });
  });

  // comments
  if ($(".comments").length) {
    const commentsForm = $("form[name=comment]");
    const formTop = commentsForm.position().top;
    let parentId;

    $(".js-show-form, .js-answer").on("click", function() {
      if (!commentsForm.is(":visible")) {
        parentId =
          $(this)
            .closest("li")
            .data("id") || null;

        commentsForm.slideDown(500).css({ display: "flex" });
      }

      $("html").animate({ scrollTop: formTop }, 500);
      commentsForm.find("textarea").focus();
    });

    // cancel comment
    $(".js-cancel-comment").on("click", function(e) {
      e.preventDefault();

      commentsForm[0].reset();
      commentsForm.slideToggle(500);
    });

    // publish comment
    $(".js-send-form").on("click", function(e) {
      e.preventDefault();

      const self = this;
      const data = {
        post: $(".comments").data("id"),
        comment: $("textarea[name=comment]").val(),
        parent: parentId
      };

      if (data.comment) {
        $.ajax({
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          url: "/comment/add",
          success: function(data) {
            const success = validateForm.call(self, data);

            if (success) {
              $(location).attr("href", location.href);
            }
          }
        });
      }
    });
  }
});
