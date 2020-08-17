import FW from '../fw/fw';
import VASTPLAYER from '../players/vast-player';
import CONTENTPLAYER from '../players/content-player';
import VPAID from '../players/vpaid';

const MUTE = {};

const _setMute = function (muted) {

  if (typeof muted !== 'boolean') {
    return;
  }
  if (this.adOnStage && this.adIsLinear) {
    if (this.isVPAID) {
      if (muted) {
        VPAID.setAdVolume.call(this, 0);
      } else {
        VPAID.setAdVolume.call(this, 1);
      }
    } else {
      VASTPLAYER.setMute.call(this, muted);
    }
  }

  CONTENTPLAYER.setMute.call(this, muted);
};

const _getMute = function () {
  if (this.adOnStage && this.adIsLinear) {
    if (this.isVPAID) {
      if (VPAID.getAdVolume.call(this) === 0) {
        return true;
      }
      return false;
    } else {
      return VASTPLAYER.getMute.call(this);
    }
  }
  
  return CONTENTPLAYER.getMute.call(this);
};

const _onClickMute = function (event) {
  if (event) {
    event.stopPropagation();
    if (event.type === 'touchend') {
      event.preventDefault();
    }
  }
  this.getMute = _getMute.bind(this);
  this.setMute = _setMute.bind(this);

  if (this.getMute()) {
    this.setMute(false);
    FW.removeClass(this.muteIcon, 'rmp-ad-container-unmute-icon');
  }
  else {
    this.setMute(true);
    FW.addClass(this.muteIcon, 'rmp-ad-container-unmute-icon');
  }
};

MUTE.append = function () {
  this.muteButton = document.createElement('div');
  this.muteButton.className = 'rmp-ad-container-mute';

  this.muteIcon = document.createElement('div');
  this.muteIcon.className = 'rmp-ad-container-mute-icon rmp-ad-container-unmute-icon';

  this.onClickMute = _onClickMute.bind(this);
  this.muteButton.addEventListener('click', this.onClickMute);
  this.muteButton.addEventListener('touchend', this.onClickMute);
  this.muteButton.appendChild(this.muteIcon);
  this.adContainer.appendChild(this.muteButton);
};

export default MUTE;
