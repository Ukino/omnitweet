// OmniBox selected OmnitTweet so update location.
chrome.omnibox.onInputStarted.addListener(
  function() {
    Notice.show_page_action(140);
    Location.search();
  });

// OmniBox cancelled so remove character counter  
chrome.omnibox.onInputCancelled.addListener(
  function() {
    // Remove page action.
    Notice.hide_page_action();
  }
);

// Suggest locations to user in OmniBox.
chrome.omnibox.onInputChanged.addListener(
  function(command, suggest) {
    if ('' == command) {
      Notice.show_page_action(140);
      return;
    }
    var suggestions = [];
    var as = localStorage.user ? ' <dim>as @' + JSON.parse(localStorage.user).screen_name + '</dim>': '';
    
    if (command.substring(0, 2) == 'd ') {
	
      var screen_name = command.split(' ', 2)[1];
      var message = command.substring(3 + screen_name.length);
      if (command.length < screen_name.length + 4) {
        suggestions = [{
          content: JSON.stringify({message: message, screen_name: screen_name}),
          description: 'Direct message @' + screen_name + ' ' + message + as
        }];
      } else {
        suggestions = [{
          content: JSON.stringify({message: message, screen_name: screen_name}),
          description: 'Direct message @' + screen_name + ' ' + message + as
        }];
      }
      Notice.show_page_action(140 + 3 + screen_name.length - countCharacters(command));

    } else {
	
      var places = Location.current();
      var suggestions = [{content: command, description: "<dim>Tweet</dim> " + command + as}];
      // Only suggest locations if the are available.
      if(places) {
        for(var place in places) {
          suggestions.push({
            content: JSON.stringify({status: command, place_id: places[place].id}),
            description: "<dim>Tweet</dim> <match>" + command + "</match> <dim>from</dim> " + places[place].name + as
          });
        }
      }
      Notice.show_page_action(140 - countCharacters(command));

    }
    suggest(suggestions);
  }
);

// User hit enter so post tweet.
chrome.omnibox.onInputEntered.addListener(
  function(command) {
    // Vars for updating users status.
    var status;
    var place_id;
    var screen_name;
    var message;
    // Remove page action if it exists
    Notice.hide_page_action();
    // Check if user hit enter in omnibox or on a dropdown suggestion.
    if (command.substring(0, 10) == '{"status":') {
      // JSON encoded status to post.
      command = JSON.parse(command);
      Twitter.update(command.status, {place_id: command.place_id});
    } else if (command.substring(0, 11) == '{"message":') {
      // JSON encoded direct message to post.
      command = JSON.parse(command);
      Twitter.message(command.screen_name, command.message);
    } else if (command.substring(0, 2) == 'd ') {
      // Direct message string that need to be parsed.
      screen_name = command.split(' ', 2)[1];
      message = command.substring(3 + screen_name.length);
      Twitter.message(screen_name, message);
    } else {
      // Else just tweet.
      status = command;
      Twitter.update(status);
    }
  }
);