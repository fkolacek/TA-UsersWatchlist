require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc) {

  //Splunk Objects
  var tokens = mvc.Components.get('submitted');
  var createSearch = mvc.Components.get('createSearch');
  var auditSearch = mvc.Components.get('auditSearch');

  //Form inputs
  var tok_users = $('[name="tok_users"]');
  var tok_risk = $('[name="tok_risk"]');
  var tok_expire = $('[name="tok_expire"]');
  var tok_monitor = $('[name="tok_monitor"]');
  var tok_reason = $('[name="tok_reason"]');

  var required_fields = [tok_users, tok_risk, tok_expire, tok_monitor, tok_reason];

  /*
    Validate form before submitting
  */
  function validateForm(){
    var result = true;

    for(var i = 0, l = required_fields.length; i < l; i++){
      if(required_fields[i].val() == ""){
        required_fields[i].css("border-color", "#FF0000");
        result = false;
      }
      else
        required_fields[i].css("border-color", "#008000");
    }

    return result;
  };

  /*
    Set form to default state
  */
  function clearForm(){
    $('form *').filter(':input').each(function(){
      $(this).val('');
    });

    for(var i = 0, l = required_fields.length; i < l; i++)
      required_fields[i].css("border-color", "#C0BFBF");

    tok_users.val('');
    tok_risk.val('2');
    tok_expire.val('12');
    tok_monitor.val('false');
    tok_reason.val('');

    $("#progress").html("");
  };

  /*
    Unset action tokens
  */
  function clearActionTokens(){
    action_tokens = [
      "atok_action_audit",
      "atok_user",
      "atok_risk",
      "atok_expire",
      "atok_monitor",
      "atok_reason"
    ];

    for(var i = 0, l = action_tokens.length; i < l; i++)
      tokens.unset(action_tokens[i]);
  };

  /*
    Button - Submit
  */
  $(document).on('click', '#submitButton', function(e){
    e.preventDefault();

    $(".box-success").css("display", "none");

    if(!validateForm())
      return;

    $("#progress").append($("<div>").addClass("loading"));

    console.log("Creating new Users entries");
    tokens.set('atok_users', tok_users.val().replaceAll("\n", "|"));
    tokens.set('atok_risk', tok_risk.val());
    tokens.set('atok_expire', tok_expire.val());
    tokens.set('atok_monitor', tok_monitor.val());
    tokens.set('atok_reason', tok_reason.val());
  });

  /*
    Button - Clear
  */
  $(document).on('click', '#clearButton', function(e){
    e.preventDefault();

    clearForm();
  });

  /*
    Initialize form
  */
  $(document).ready(function(){
    console.log("Users loaded");

    clearForm();
  });

  /*
    Set handlers
  */
  createSearch.on('search:done', function() {
    tokens.set("atok_action_audit", "1");
    $(".box-success").css("display", "inline-block");
    clearForm();
  });
  auditSearch.on('search:done', function(){
    clearActionTokens();
  });
});
