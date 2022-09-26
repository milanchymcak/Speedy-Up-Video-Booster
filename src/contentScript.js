/* global chrome */

// Volume Control of Audio context
class SpeedyControlClass {
  constructor() {
    // Get all videos
    this.video = document.querySelector('video');

    // Init
    this.volume = 1;
    this.speed = 1;
  }

  // Resume
  resumeVol() {
    // Create audio context
    this.audioContext = new AudioContext();

    // Must be defined
    if (this.video === undefined || this.video === null) return false;

    // Resume Ctx
    this.audioContext.resume();

    // Add target element to the audio source
    this.audioSource = this.audioContext.createMediaElementSource(this.video);

    // Create gain node
    this.gainNode = this.audioContext.createGain();

    // Default Value
    this.volumeChange();
  }

  initVolume(vol = 100) {
    this.volume = vol / 100;
  }

  // Change Volume
  volumeChange() {
    this.gainNode.gain.value = this.volume;

    // Fix negative values
    if (this.gainNode.gain.value < 0) this.gainNode.gain.value = 0;

    this.audioSource.connect(
      this.gainNode,
    );

    // Connect
    this.gainNode.connect(this.audioContext.destination);
  }

  initSpeed(speed) {
    this.speed = speed;
  }

  // Change Speed
  speedChange() {
    if (this.speed < 0.1) this.speed = 0.1;

    this.video.playbackRate = this.speed;
  }
}

// Get init values - Volume
const counterVolumeStorage = {
  get: (cb) => {
    chrome.storage.sync.get(['count'], (result) => {
      cb(result.count);
    });
  },
  set: (value, cb) => {
    chrome.storage.sync.set(
      {
        count: value,
      },
      () => {
        cb();
      },
    );
  },
};

// Get init values - Speed
const counterSpeedStorage = {
  get: (cb) => {
    chrome.storage.sync.get(['speed'], (result) => {
      cb(result.speed);
    });
  },
  set: (value, cb) => {
    chrome.storage.sync.set(
      {
        speed: value,
      },
      () => {
        cb();
      },
    );
  },
};

// Init
window.addEventListener('load', (event) => {
  // Important Constants
  const SpeedyControl = new SpeedyControlClass();
  const SpeedyVideo = document.querySelector('video');
  const { body } = document;

  if (SpeedyVideo === undefined || SpeedyVideo === null) return false;
  if (body === undefined || body === null) return false;

  // Add init to the body
  // https://goo.gl/7K7WLu
  if (SpeedyVideo.paused === false) {
    if (!document.body.classList.contains('speedy-init')) {
      // Volume Init
      counterVolumeStorage.get((count) => {
        if (typeof count === 'undefined') {
          // Set counter value as 100
          counterVolumeStorage.set(100, () => {
            SpeedyControl.initVolume(100);
          });
        } else {
          SpeedyControl.initVolume(count);
        }
        SpeedyControl.resumeVol();
      });

      // Speed Init
      counterSpeedStorage.get((speed) => {
        if (typeof speed === 'undefined') {
          // Set counter value as 1
          counterSpeedStorage.set(1, () => {
            SpeedyControl.initSpeed(1);
          });
        } else {
          SpeedyControl.initSpeed(speed);
        }
        SpeedyControl.speedChange();
      });

      body.classList.add('speedy-init');
    }
  } else {
    document.body.addEventListener('click', () => {
      if (!document.body.classList.contains('speedy-init')) {
        // Volume Init
        counterVolumeStorage.get((count) => {
          if (typeof count === 'undefined') {
            // Set counter value as 100
            counterVolumeStorage.set(100, () => {
              SpeedyControl.initVolume(100);
            });
          } else {
            SpeedyControl.initVolume(count);
          }
          SpeedyControl.resumeVol();
        });

        // Speed Init
        counterSpeedStorage.get((speed) => {
          if (typeof speed === 'undefined') {
            // Set counter value as 1
            counterSpeedStorage.set(1, () => {
              SpeedyControl.initSpeed(1);
            });
          } else {
            SpeedyControl.initSpeed(speed);
          }
          SpeedyControl.speedChange();
        });

        body.classList.add('speedy-init');
      }
    });
  }

  // Listen for message
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Volume Change
    if (
      SpeedyVideo !== undefined
      && SpeedyVideo !== null
      && document.body !== undefined
      && document.body !== null
      && document.body.classList.contains('speedy-init')
      && SpeedyControl !== undefined
      && request.type === 'Volume'
    ) {
      SpeedyControl.initVolume(request.count);

      // Change Volume
      SpeedyControl.volumeChange();
    }

    // Speed Change
    if (
      SpeedyVideo !== undefined
      && SpeedyVideo !== null
      && document.body !== undefined
      && document.body !== null
      && document.body.classList.contains('speedy-init')
      && SpeedyControl !== undefined
      && request.type === 'Speed'
    ) {
      SpeedyControl.initSpeed(request.speed);

      // Change Volume
      SpeedyControl.speedChange();
    }

    // Send an empty response
    // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
    sendResponse({});
    return true;
  });
});
