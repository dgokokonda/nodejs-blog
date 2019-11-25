$(function () {
  function resetForms(form, reset) {
    form.find("input.error, textarea.error, div.error").removeClass("error");
    form.children("p.error, p.success").remove();

    if (reset) {
      form.find("input.error, textarea.error").val("");
      form.find("div.error").html("");
    }
  }

  function validateForm(data) {
    const form = this.tagName == 'FORM' ? $(this) : $(this).closest("form");
    form.children("p").remove();

    if (!data.ok) {
      if (data.error) {
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
        data.fields.forEach(function (item) {
          form.find("#" + item).addClass("error");
        });
      }
    } else {
      resetForms(form);
    }
    return data.ok;
  }

  $(".js-reg, .js-auth").click(function (e) {
    e.preventDefault();
    $(".box form").slideToggle(500);
    resetForms($(".box form"));
  });

  // clear
  $("input").on("focus", function () {
    resetForms($(this).closest("form"), false);
  });

  $(".form-group").on("click", function () {
    resetForms($(this).closest("form"), false);
  });

  // register
  $(".js-confirm-reg").on("click", function (e) {
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
    }).done(function (data) {
      const success = validateForm.call(el, data);

      if (success) {
        $(location).attr("href", "/");
      }
    });
  });

  // authorization
  $(".js-confirm-auth").on("click", function (e) {
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
    }).done(function (data) {
      const success = validateForm.call(el, data);

      if (success) {
        $(location).attr("href", "/");
      }
    });
  });

  $(".box form input").on("keydown", function (e) {
    if (e.key == "Enter") {
      $(this)
        .closest("form")
        .find(".btns button:last-child")
        .trigger("click");
      e.preventDefault();
    }
  });

  // publish post or save to draft
  $(".js-publish-post, .js-save-post").on("click", function (e) {
    e.preventDefault();
    const self = this;
    const isDraft = $(this).is('.js-save-post') ? true : false;
    const data = {
      title: $("#post-title").val(),
      body: $("#post-body").val(),
      postId: $('#postId').val(),
      isDraft
    };

    $.ajax({
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      url: "/post/add"
    }).done(function (data) {
      const success = validateForm.call(self, data);
      if (success) {
        switch (data.post.status) {
          case 'draft':
            $(location).attr('href', `/post/edit/${data.post.id}`);
            break;

          case 'published':
            $(location).attr("href", `/posts/${data.post.url}`);
            break;

          default:
            break;
        }
      }
    });
  });

  // comments
  if ($(".comments").length) {
    const commentsForm = $("form[name=comment]");
    const anchor = $('.comments').position().top;
    let parentId;

    $(".js-show-form, .js-answer").on("click", function () {
      if (!commentsForm.is(":visible")) {
        parentId =
          $(this)
            .closest("li")
            .attr("id") || null;

        commentsForm.slideDown(500).css({ display: "flex" });
      }

      $("html").animate({ scrollTop: anchor }, 500);
      commentsForm.find("textarea").focus();
    });

    // cancel comment
    $(".js-cancel-comment").on("click", function (e) {
      e.preventDefault();

      commentsForm[0].reset();
      commentsForm.slideToggle(500);
    });

    // publish comment
    $(".js-send-form").on("click", function (e) {
      e.preventDefault();

      const self = this;
      const formData = {
        post: $(".comments").attr("id"),
        comment: $("textarea[name=comment]").val(),
        parent: parentId
      };

      if (formData.comment) {
        $.ajax({
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(formData),
          url: "/comment/add",
          success: async function (data) {
            const success = validateForm.call(self, data);

            if (success) {
              $(location).attr("href", data.url);
              location.reload(true);
            }
          }
        });
      }
    });
  }

  // upload
  if ($(".add-post").length) {
    $("#upload").on("submit", function (e) {
      e.preventDefault();
      const self = $(this);

      $.ajax({
        type: "POST",
        contentType: "multipart/form-data",
        url: "/upload/image",
        data: new FormData(this),
        processData: false,
        contentType: false,
        success: function (data) {
          validateForm.call(self, data);
          if (data.ok) {
            self.children()
              .eq(0)
              .before('<p class="success">Загрузка прошла успешно!</p>');
          }
        },
        error: function (e) {
          console.log(e);
        }
      });
    });
  }

  // edit post

});
