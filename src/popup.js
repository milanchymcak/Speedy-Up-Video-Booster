/* global chrome */

import './popup.css';

/// /
// Volume Component
//
/// /
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

function updateVolumeCounter({ type }) {
  counterVolumeStorage.get((count) => {
    let newCount;

    document.getElementById('volume').innerHTML = `${count}%`;

    if (type === 'INCREMENT') {
      newCount = count + 20;
    } else if (type === 'DECREMENT') {
      newCount = count - 20;
    } else {
      newCount = count;
    }
    if (newCount < 0) newCount = 0;

    counterVolumeStorage.set(newCount, () => {
      document.getElementById('volume').innerHTML = `${newCount}%`;

      // Communicate with content script of
      // active tab by sending a message
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            volume: type,
            type: 'Volume',
            count: newCount,
          },
        );
      });
    });
  });
}

function setupVolumeCounter(initialValue = 100) {
  document.getElementById('volume').innerHTML = `${initialValue}%`;

  document.getElementById('incrementBtn').addEventListener('click', () => {
    updateVolumeCounter({
      type: 'INCREMENT',
    });
  });

  document.getElementById('decrementBtn').addEventListener('click', () => {
    updateVolumeCounter({
      type: 'DECREMENT',
    });
  });
}

function restoreVolumeCounter() {
  // Restore count value
  counterVolumeStorage.get((count) => {
    if (typeof count === 'undefined') {
      // Set counter value as 100
      counterVolumeStorage.set(100, () => {
        setupVolumeCounter(100);
      });
    } else {
      setupVolumeCounter(count);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreVolumeCounter);

/// /
// Speed Component
//
/// /
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

function updateSpeedCounter({ type }) {
  counterSpeedStorage.get((count) => {
    let newCount;
    document.getElementById('speed').innerHTML = `${count.toFixed(1)}x`;

    if (type === 'INCREMENT') {
      newCount = count + 0.1;
    } else if (type === 'DECREMENT') {
      newCount = count - 0.1;
    } else {
      newCount = count;
    }

    if (newCount < 0.1) newCount = 0.1;

    counterSpeedStorage.set(newCount, () => {
      document.getElementById('speed').innerHTML = `${newCount.toFixed(1)}x`;

      // Communicate with content script of
      // active tab by sending a message
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            volume: type,
            type: 'Speed',
            speed: newCount,
          },
        );
      });
    });
  });
}

function setupSpeedCounter(initialValue = 1) {
  document.getElementById('speed').innerHTML = `${initialValue.toFixed(1)}x`;

  document.getElementById('incrementSpeedBtn').addEventListener('click', () => {
    updateSpeedCounter({
      type: 'INCREMENT',
    });
  });

  document.getElementById('decrementSpeedBtn').addEventListener('click', () => {
    updateSpeedCounter({
      type: 'DECREMENT',
    });
  });
}

function restoreSpeedCounter() {
  // Restore count value
  counterSpeedStorage.get((speed) => {
    if (typeof speed === 'undefined') {
      // Set counter value as 1
      counterSpeedStorage.set(1, () => {
        setupSpeedCounter(1);
      });
    } else {
      setupSpeedCounter(speed);
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreSpeedCounter);
