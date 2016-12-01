/**
 * Intercom: https://github.com/diy/intercom.js/
 * Tips on using intercom with GAS: https://github.com/googlesamples/apps-script-dialog2sidebar
 *
 *
 */

var Util = require('./util.js');
var Cards = require('./cards-handler.js');
var NavBar = require('./nav/navigation-bar.js');
var PubSub = require('pubsub-js');
var EmailRule = require('./data/email-rule.js');
//var Intercom = require('./intercom.js');

var MailMan = function() {

  // ***** CONSTANTS ***** //

  //***** LOCAL VARIABLES *****//

  var self;

  // The object used to communicate between the sidebar and the RTE (Rich Text Editor)
  var intercom;

	// How long to wait for the dialog to check-in before assuming it's been closed, in milliseconds.
	var DIALOG_TIMEOUT_MS = 2000;

  // This handles much of the configuration of the Cards.
  var cards;

  // This handles all the nav-bar navigation.
  var navBar;

	/**
	 * Holds a mapping from dialog ID to the ID of the timeout that is used to
	 * check if it was lost. This is needed so we can cancel the timeout when
	 * the dialog is closed.
	 */
	var timeoutIds = {};

  //***** PUBLIC *****//

  /**
   * Performs basic set up of the Mailman environment.
   *
   * @constructor
   */
  this.init = function() {
    self = this;

    // UI Configuration
    intercom = Intercom.getInstance();
    contentArea = $('#content-area');

    cards = new Cards(contentArea);
    setButtonState();

    navBar = new NavBar($('#nav-row'), 3, function(e) {
      var node = e.data;

      cards.jumpTo(node.name);
    });

    navBar.buildNavTree(cards.getActiveNode());

    // All UI Bindings
    $('#step').on('click', self.next);
    $('#done').on('click', self.done);
    $('#back').on('click', self.back);
    $('#help').on('click', self.onHelpClick);

    // PubSub bindings

    // It's important to note the flow of the program here.
    // When cards.jumpTo is called, this pubsub function is called.
    // jump to a card > rebuild the nav tree
    PubSub.subscribe('Cards.jumpTo', function(msg, data) {
      var activeNode = cards.getActiveNode();
      navBar.buildNavTree(cards.getActiveNode());
      setButtonState();
    });
  };

  /**
   * This function goes to the next card.
   * TODO There is non-DRY code between this function and this.back.
   *
   * @param {event} event The event that triggered the function call.
   */
  this.next = function(event) {
    var active = cards.next();
    setButtonState();

    navBar.buildNavTree(active);
  };

  /**
   * This function goes to the previous card.
   * TODO There is non-DRY code between this function and this.next.
   *
   * @param {event} event The event that triggered the function call.
   */
  this.back = function(event) {
    var active = cards.back();
    setButtonState();

    navBar.buildNavTree(active);
  };

  /**
   * Submits data back to google.
   * NOTE: GAS only
   *
   * @param {event} event The event that triggered the function call.
   */
  this.done = function(event) {
    cards.submit();
  };

  /**
   * This function toggles the state of the help <p> tags.
   *
   */
  this.onHelpClick = function() {
    cards.toggleHelp();
  };

  //***** PRIVATE *****//

  /**
   * Using the Cards handler, this sets the state of the buttons.
   * Depending on the active Card, different buttons may be shown.
   *
   */
  var setButtonState = function() {
    // Default state
    Util.setHidden($('#done'), true);
    Util.setHidden($('#step'), false);
    Util.setHidden($('#back'), false);

    if (cards.isFirst()) {
      Util.setHidden($('#back'), true);
    }
    else if (cards.isLast()) {
      Util.setHidden($('#done'), false);
      Util.setHidden($('#step'), true);
    }
  };

  var onRTEOpened = function(dialogId) {

    intercom.on(dialogId, function(data) {

          switch (data.state) {
            case 'done':
              console.log('Dialog submitted.\n');

              getNode('Body').data.setValue(data.message);

              forget(dialogId);
              break;
            case 'checkIn':
              forget(dialogId);
              watch(dialogId);
              break;
            case 'lost':
              console.log('Dialog lost.\n');
              break;
            default:
              throw 'Unknown dialog state: ' + data.state;
          }
        });
  };

  /**
   * Watch the given dialog, to detect when it's been X-ed out.
   *
   * @param {string} dialogId The ID of the dialog to watch.
   */
  var watch = function(dialogId) {
    timeoutIds[dialogId] = window.setTimeout(function() {
      intercom.emit(dialogId, 'lost');
    }, DIALOG_TIMEOUT_MS);
  };

  /**
   * Stop watching the given dialog.
   * @param {string} dialogId The ID of the dialog to watch.
   */
  var forget = function(dialogId) {
    if (timeoutIds[dialogId]) {
      window.clearTimeout(timeoutIds[dialogId]);
    }
  };

  this.init();
};


/**  */
module.exports = MailMan;
