import FW from '../fw/fw';
import VASTPLAYER from '../players/vast-player';
import CONTENTPLAYER from '../players/content-player';
import VPAID from '../players/vpaid';

const MUTE = {};

const _setMute = function (muted) {
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
  if (!this.adOnStage || !this.adIsLinear) {
    return CONTENTPLAYER.getMute.call(this);
  }

  return this.isVPAID
    ? VPAID.getAdVolume.call(this) === 0
    : VASTPLAYER.getMute.call(this);
};

const _onClickMute = function (event) {
  event.stopPropagation();
  if (event.type === 'touchend') {
    event.preventDefault();
  }

  if (_getMute.call(this)) {
    _setMute.call(this, false);
    FW.removeClass(this.muteIcon, 'rmp-ad-container-unmute-icon');
  }
  else {
    _setMute.call(this, true);
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
