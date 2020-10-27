import FW from '../fw/fw';
import VASTERRORS from './vast-errors';
import PING from '../tracking/ping';

const HELPERS = {};

HELPERS.filterParams = function (inputParams) {
  const defaultParams = {
    ajaxTimeout: 5000,
    creativeLoadTimeout: 8000,
    ajaxWithCredentials: false,
    maxNumRedirects: 4,
    maxNumItemsInAdPod: 10,
    pauseOnClick: true,
    skipMessage: 'Skip ad',
    skipWaitingMessage: 'Skip ad in',
    textForClickUIOnMobile: '', //'Learn more',
    enableVpaid: true,
    outstream: false,
    vpaidSettings: {
      width: 640,
      height: 360,
      viewMode: 'normal',
      desiredBitrate: 500
    }
  };
  this.params = defaultParams;
  if (FW.isObject(inputParams)) {
    const keys = Object.keys(inputParams);
    for (let i = 0, len = keys.length; i < len; i++) {
      const prop = keys[i];
      if (typeof inputParams[prop] === typeof this.params[prop]) {
        if ((FW.isNumber(inputParams[prop]) && inputParams[prop] > 0) || typeof inputParams[prop] !== 'number') {
          if (prop === 'vpaidSettings') {
            if (FW.isNumber(inputParams.vpaidSettings.width) && inputParams.vpaidSettings.width > 0) {
              this.params.vpaidSettings.width = inputParams.vpaidSettings.width;
            }
            if (FW.isNumber(inputParams.vpaidSettings.height) && inputParams.vpaidSettings.height > 0) {
              this.params.vpaidSettings.height = inputParams.vpaidSettings.height;
            }
            if (typeof inputParams.vpaidSettings.viewMode === 'string' && inputParams.vpaidSettings.viewMode === 'fullscreen') {
              this.params.vpaidSettings.viewMode = inputParams.vpaidSettings.viewMode;
            }
            if (FW.isNumber(inputParams.vpaidSettings.desiredBitrate) && inputParams.vpaidSettings.desiredBitrate > 0) {
              this.params.vpaidSettings.desiredBitrate = inputParams.vpaidSettings.desiredBitrate;
            }
          } else {
            this.params[prop] = inputParams[prop];
          }
        }
      }
    }
    // we need to avoid infinite wrapper loops scenario 
    // so we cap maxNumRedirects to 30 
    if (this.params.maxNumRedirects > 30) {
      this.params.maxNumRedirects = 30;
    }
  }
};

HELPERS.createApiEvent = function (event) {
  // adloaded, addurationchange, adclick, adimpression, adstarted, 
  // adtagloaded, adtagstartloading, adpaused, adresumed 
  // advolumemuted, advolumechanged, adcomplete, adskipped, 
  // adskippablestatechanged, adclosed
  // adfirstquartile, admidpoint, adthirdquartile, aderror, 
  // adfollowingredirect, addestroyed
  // adlinearchange, adexpandedchange, adremainingtimechange 
  // adinteraction, adsizechange
  if (typeof event === 'string' && event !== '') {
    FW.createStdEvent(event, this.container);

    if (COLLECT_DEBUG_DATA) {
      if (event === 'adloaded') {
        window.adloadedEvent = 'adloaded';
      }
      if (event === 'adimpression') {
        window.adimpressionEvent = 'adimpression';
        if (SEND_LOGS_ONIMPRESSION) {
          FW.sendDebugData();
        }
      }
      if (event === 'aderror') {
        window.aderrorEvent = 'aderror';
        FW.sendDebugData();
      }
    }
  }
};

HELPERS.dispatchPingEvent = function (event) {
  if (event) {
    let element;
    if (this.adIsLinear && this.vastPlayer) {
      element = this.vastPlayer;
    } else if (!this.adIsLinear && this.nonLinearContainer) {
      element = this.nonLinearContainer;
    }
    if (element) {
      if (Array.isArray(event)) {
        event.forEach((currentEvent) => {
          FW.createStdEvent(currentEvent, element);
        });
      } else {
        FW.createStdEvent(event, element);
      }
    }
  }
};

HELPERS.playPromise = function (whichPlayer, firstPlayerPlayRequest) {
  let targetPlayer;
  switch (whichPlayer) {
    case 'content':
      targetPlayer = this.contentPlayer;
      break;
    case 'vast':
      targetPlayer = this.vastPlayer;
      break;
    default:
      break;
  }
  if (targetPlayer) {
    const playPromise = targetPlayer.play();
    // most modern browsers support play as a Promise
    // this lets us handle autoplay rejection 
    // https://developers.google.com/web/updates/2016/03/play-returns-promise
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (firstPlayerPlayRequest) {
          if (DEBUG) {
            FW.log('initial play promise on ' + whichPlayer + ' player has succeeded');
          }
          HELPERS.createApiEvent.call(this, 'adinitialplayrequestsucceeded');
        }
      }).catch((e) => {
        if (firstPlayerPlayRequest && whichPlayer === 'vast' && this.adIsLinear) {
          if (DEBUG) {
            FW.log(e);
            FW.log('e.message - ' + e.message);
            FW.log('initial play promise on VAST player has been rejected for linear asset - likely autoplay is being blocked');
          }
          PING.error.call(this, 400);
          VASTERRORS.process.call(this, 400);
          HELPERS.createApiEvent.call(this, 'adinitialplayrequestfailed');
        } else if (firstPlayerPlayRequest && whichPlayer === 'content' && !this.adIsLinear) {
          if (DEBUG) {
            FW.log(e);
            FW.log('e.message - ' + e.message);
            FW.log('initial play promise on content player has been rejected for non-linear asset - likely autoplay is being blocked');
          }
          HELPERS.createApiEvent.call(this, 'adinitialplayrequestfailed');
        } else {
          if (DEBUG) {
            FW.log(e);
            FW.log('e.message - ' + e.message);
            FW.log('playPromise on ' + whichPlayer + ' player has been rejected');
          }
        }
      });
    }
  }
};

HELPERS.accessibleButton = function (element, ariaLabel) {
  // make skip button accessible
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.addEventListener('keyup', (event) => {
    const code = event.which;
    // 13 = Return, 32 = Space
    if ((code === 13) || (code === 32)) {
      event.stopPropagation();
      event.preventDefault();
      FW.createStdEvent('click', element);
    }
  });
  if (ariaLabel) {
    element.setAttribute('aria-label', ariaLabel);
  }
};

export default HELPERS;
