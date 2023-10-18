require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc) {

  //Splunk Objects
  var tokens = mvc.Components.get('submitted');
  var updateSearch = mvc.Components.get('updateSearch');
  var createSearch = mvc.Components.get('createSearch');
  var deleteSearch = mvc.Components.get('deleteSearch');
  var auditSearch = mvc.Components.get('auditSearch');
  var usersSearch = mvc.Components.get('UsersSearch');

  //Form inputs
  var tok_user = $('[name="tok_user"]');
  var tok_risk = $('[name="tok_risk"]');
  var tok_expire = $('[name="tok_expire"]');
  var tok_monitor = $('[name="tok_monitor"]');
  var tok_reason = $('[name="tok_reason"]');
  var tok_key = $('[name="tok_key"]')

  var required_fields = [tok_user, tok_risk, tok_expire, tok_monitor, tok_reason];

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
    Set action items and start search
  */
  function performAction(action){
    //Setting dashboard action tokens
    tokens.set('atok_user', tok_user.val());
    tokens.set('atok_risk', tok_risk.val());
    tokens.set('atok_expire', tok_expire.val());
    tokens.set('atok_monitor', tok_monitor.val());
    tokens.set('atok_reason', tok_reason.val());

    //Delete
    if(action == "delete"){
      tokens.set("atok_action", "delete");
      tokens.set('atok_key', tok_key.val());
      tokens.set('atok_action_delete', "1");
    }
    //Create or Update
    else{
      //Create
      if(tok_key.val() == ''){
        tokens.set("atok_action", "create");
        tokens.set("atok_action_create", "1");
      }
      //Update
      else{
        tokens.set("atok_action", "update");
        tokens.set('atok_key', tok_key.val());
        tokens.set("atok_action_update", "1");
      }
    }

    //Audit
    //tokens.set("atok_action_audit", "1");
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

    tok_user.val('');
    tok_risk.val('2');
    tok_expire.val('12');
    tok_monitor.val('false');
    tok_reason.val('');
    tok_key.val('');

    $("#progress").html("");
  };

  /*
    Unset action tokens
  */
  function clearActionTokens(){
    action_tokens = [
      "atok_action_create",
      "atok_action_update",
      "atok_action_delete",
      "atok_action_audit",
      "atok_action",
      "atok_user",
      "atok_risk",
      "atok_expire",
      "atok_monitor",
      "atok_reason",
      "atok_key"
    ];

    for(var i = 0, l = action_tokens.length; i < l; i++)
      tokens.unset(action_tokens[i]);
  };

  /*
    On click on Users
  */
  $("#UsersTable").delegate('td', 'click', function(e){
    e.preventDefault();

    clearForm();

    var row = $(this).closest('tr');
    var columns = row.find('td');

    var values = [];
    $.each(columns, function(i, item) {
        values[i] = item.innerHTML;
    });

    //Set form values
    tok_user.val(values[0]);
    tok_risk.val(get_risk(values[3]));
    tok_expire.val(get_expiration(values[4]))
    tok_monitor.val(values[5]);
    tok_reason.val(values[6]);
    tok_key.val(values[7]);
  });

  /*
    Button - Submit
  */
  $(document).on('click', '#submitButton', function(e){
    e.preventDefault();

    if(!validateForm())
      return;

    $("#progress").append($("<div>").addClass("loading"));

    performAction("create-or-update");
  });

  /*
    Button - Delete
  */
  $(document).on('click', '#deleteButton', function(e){
    e.preventDefault();

    $("#progress").append($("<div>").addClass("loading"));

    performAction("delete");
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

    if(tok_user.val() == "$tok_user|h$")
      tok_user.val('');

    tok_risk.val('2');
    tok_expire.val('12');

    if(tok_monitor.val() == "$tok_monitor|h$")
      tok_monitor.val('');

    tok_reason.val('');
    tok_key.val('');
  });

  /*
    Set handlers
  */
  updateSearch.on('search:done', function(){
    tokens.set("atok_action_audit", "1");
    usersSearch.startSearch();
    clearForm();
  });
  createSearch.on('search:done', function(){
    tokens.set("atok_action_audit", "1");
    usersSearch.startSearch();
    clearForm();
  });
  deleteSearch.on('search:done', function(){
    tokens.set("atok_action_audit", "1");
    usersSearch.startSearch();
    clearForm();
  });
  auditSearch.on('search:done', function(){
    clearActionTokens();
  });
});
