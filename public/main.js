$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  
  var $page1 = $('.page1');
  var $page2 = $('.page2');
  var $page3 = $('.page3');
  var $page4 = $('.page4');
  var $page5 = $('.page5');
  var $page6 = $('.page6');
  var $over = $('.over');
  $page1.hide();
  $page2.hide();
  $page3.hide();
  $page4.hide();
  $page5.hide();
  $page6.hide();
  $over.hide();

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $page1.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }
  $('.map_icon').hover(
  function() {
    $('.imgBG').show()
  }, function() {
    $('.imgBG').hide()
  });
  $('.imgBG').hover(
  function() {
    $('.imgBG').show()
  }, function() {
    $('.imgBG').hide()
  });
  // $('.map_icon').mouseenter(() => $('.imgBG').show()); //() => $('.imgBG').hide()
  // $('.map_icon').mouseleave(() => $('.imgBG').hide()); //() => $('.imgBG').hide()

  // Keyboard events
  $(document).keypress(function () {
    console.log('keydown');
    $('.imgBG').hide();
  })
  
  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });
  
  var socket = io();
  $('.button1').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1
    }));
    $page1.fadeOut();
    $page1.remove();
    $page2.show();
    return false;
  })
  $('.button2').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1
    }));
    $page2.fadeOut();
    $page2.remove();
    $page3.show();
    return false;
  })
  $('.button3').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1
    }));
    $page3.fadeOut();
    $page3.remove();
    $page4.show();
    return false;
  })
  $('.button4').click(function(){
    // socket.emit('chat message', JSON.stringify({
    //   user: username,
    //   val: 1
    // }));
    $page4.fadeOut();
    $page4.remove();
    $page5.show();
    return false;
  })
  $('.button5').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1
    }));
    $page5.fadeOut();
    $page5.remove();
    $page6.show();
    return false;
  })
  $('.button6').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1
    }));
    $page6.fadeOut();
    $page6.remove();
    $over.show();
    return false;
  })
  $('.win1').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1000
    }));
    $('#m').val('');
    $page1.fadeOut();
    $page1.remove();
    $page2.show();
    return false;
  });
  $('.win2').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1000
    }));
    $('#m').val('');
    $page2.fadeOut();
    $page2.remove();
    $page3.show();
    return false;
  });
  $('.win3').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1000
    }));
    $('#m').val('');
    $page3.fadeOut();
    $page3.remove();
    $page4.show();
    return false;
  });
  $('.win4').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1000
    }));
    $('#m').val('');
    $page4.fadeOut();
    $page4.remove();
    $page5.show();
    return false;
  });
  $('.win5').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1000
    }));
    $('#m').val('');
    $page5.fadeOut();
    $page5.remove();
    $page6.show();
    return false;
  });
  $('.win6').click(function(){
    socket.emit('chat message', JSON.stringify({
      user: username,
      val: 1000
    }));
    $('#m').val('');
    $page6.fadeOut();
    $page6.remove();
    $over.show();
    return false;
  });
  socket.on('score', function(msg){
    $('#messages').append($('<li>').text(msg));
  });
  socket.on('score', (leaders) => {
    console.log(leaders);
    leaders_text = "\n";
    leaders.forEach((leader) => {
      leaders_text += ("  - " + leader.name + " (" + leader.points + ")")
    })
    $('.leaders').text(leaders_text);
  })
});
