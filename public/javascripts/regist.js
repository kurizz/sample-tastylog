let btnSubmit_onClick = event => {
  let $submit = $(event.currentTarget);
  let $form = $submit.parents("form");

  $form.attr("method", $submit.data("method"));
  $form.attr("action", $submit.data("action"));
  $form.submit();
};

let document_onready = event => {
  $("input[type='submit']").on("click", btnSubmit_onClick);
}

$(document).ready(document_onready);
