import FW from '../fw/fw';
import HELPERS from '../utils/helpers';
import VASTPLAYER from '../players/vast-player';

const VASTERRORS = {}; 

// Indicates that the error was encountered when the ad was being loaded. 
// Possible causes: there was no response from the ad server, malformed ad response was returned ...
const loadErrorList = [
  100, 101, 102,
  300, 301, 302, 303,
  900,
  1000, 1001
];

// Indicates that the error was encountered after the ad loaded, during ad play. 
// Possible causes: ad assets could not be loaded, etc.
const playErrorList = [
  200, 201, 202, 203,
  400, 401, 402, 403, 405,
  500, 501, 502, 503,
  600, 601, 602, 603, 604,
  901,
  1002, 1003, 1004
];

const vastErrorsList = [{
  code: 100,
  description: 'XML parsing error.'
}, {
  code: 101,
  description: 'VAST schema validation error.'
}, {
  code: 102,
  description: 'VAST version of response not supported.'
}, {
  code: 200,
  description: 'Trafficking error. Video player received an Ad type that it was not expecting and/or cannot display.'
}, {
  code: 201,
  description: 'Video player expecting different linearity.'
}, {
  code: 202,
  description: 'Video player expecting different duration.'
}, {
  code: 203,
  description: 'Video player expecting different size.'
}, {
  code: 300,
  description: 'General Wrapper error.'
}, {
  code: 301,
  description: 'Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element. (URI was either unavailable or reached a timeout as defined by the video player.)'
}, {
  code: 302,
  description: 'Wrapper limit reached, as defined by the video player. Too many Wrapper responses have been received with no InLine response.'
}, {
  code: 303,
  description: 'No Ads VAST response after one or more Wrappers.'
}, {
  code: 400,
  description: 'General Linear error. Video player is unable to display the Linear Ad.'
}, {
  code: 401,
  description: 'File not found. Unable to find Linear/MediaFile from URI.'
}, {
  code: 402,
  description: 'Timeout of MediaFile URI.'
}, {
  code: 403,
  description: 'Couldn\'t find MediaFile that is supported by this video player, based on the attributes of the MediaFile element.'
}, {
  code: 405,
  description: 'Problem displaying MediaFile. Video player found a MediaFile with supported type but couldn\'t display it. MediaFile may include: unsupported codecs, different MIME type than MediaFile@type, unsupported delivery method, etc.'
}, {
  code: 500,
  description: 'General NonLinearAds error.'
}, {
  code: 501,
  description: 'Unable to display NonLinear Ad because creative dimensions do not align with creative display area (i.e. creative dimension too large).'
}, {
  code: 502,
  description: 'Unable to fetch NonLinearAds/NonLinear resource.'
}, {
  code: 503,
  description: 'Couldn\'t find NonLinear resource with supported type.'
}, {
  code: 600,
  description: 'General CompanionAds error.'
}, {
  code: 601,
  description: 'Unable to display Companion because creative dimensions do not fit within Companion display area (i.e., no available space).'
}, {
  code: 602,
  description: 'Unable to display Required Companion.'
}, {
  code: 603,
  description: 'Unable to fetch CompanionAds/Companion resource.'
}, {
  code: 604,
  description: 'Couldn\'t find Companion resource with supported type.'
}, {
  code: 900,
  description: 'Undefined Error.'
}, {
  code: 901,
  description: 'General VPAID error.'
}, {
  code: 1000,
  description: 'Error processing AJAX call to retrieve adTag'
}, {
  code: 1001,
  description: 'Invalid input for loadAds method'
}, {
  code: 1002,
  description: 'Required DOMParser API is not available'
}, {
  code: 1003,
  description: 'Could not get source for content player'
}, {
  code: 1004,
  description: 'Could not find vast player in DOM'
}];

const _updateVastError = function (errorCode) {
  const error = vastErrorsList.filter((value) => {
    return value.code === errorCode;
  });
  if (error.length > 0) {
    this.vastErrorCode = error[0].code;
    this.vastErrorMessage = error[0].description;
  } else {
    this.vastErrorCode = -1;
    this.vastErrorMessage = 'Error getting VAST error';
  }
  if (this.vastErrorCode > -1) {
    if (loadErrorList.indexOf(this.vastErrorCode) > -1) {
      this.adErrorType = 'adLoadError';
    } else if (playErrorList.indexOf(this.vastErrorCode) > -1) {
      this.adErrorType = 'adPlayError';
    }
  }
  if (DEBUG) {
    FW.log('VAST error code is ' + this.vastErrorCode);
    FW.log('VAST error message is ' + this.vastErrorMessage);
    FW.log('Ad error type is ' + this.adErrorType);
    if (COLLECT_DEBUG_DATA) {
      window.vastErrorCode = this.vastErrorCode;
      window.vastErrorMessage = this.vastErrorMessage;
      window.adErrorType = this.adErrorType;
    }
  }
};

VASTERRORS.process = function (errorCode) {
  _updateVastError.call(this, errorCode);
  HELPERS.createApiEvent.call(this, 'aderror');
  VASTPLAYER.resumeContent.call(this);
};

export default VASTERRORS;
