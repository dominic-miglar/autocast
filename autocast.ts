const nodecastor: Nodecastor = require('nodecastor');

const log = console.log

const castAppId = process.env.AUTOCAST_CAST_APP_ID || 'B3F86161'
const castMessageNamespace = process.env.AUTOCAST_MESSAGE_NAMESPACE || 'urn:x-cast:at.netunix.autocast'
const url = process.env.AUTOCAST_URL || 'https://raw.githubusercontent.com/dominic-miglar/autocast/master/README.md'

log('Starting Autocast...', new Date().toLocaleString());

function isRunningAutocast(status: CastStatus): boolean {
  return !isIdle(status) && status.applications.find(app => app.appId === castAppId) != null;
}

function isIdle(status: CastStatus): boolean {
  return status.applications == null || status.applications.every(app => app.isIdleScreen);
}

function cast(device: CastDevice, data: CastInitData): void {
  device.application(castAppId, (error, app) => {
    if (error) {
      log(`Error casting Autocast (${castAppId}) on ${device.friendlyName}`, error);
      return;
    }

    log(`Autocast app (${castAppId}) launched on ${device.friendlyName}`, app.id);

    app.run(castMessageNamespace, (error, session) => {
      if (error) {
        log(`Error running Autocast app (${castAppId}) on ${device.friendlyName}`, error);
        return;
      }

      session.send(data);
    });
  });
}

const timeoutIds: { [deviceId: string]: any } = {};

function tryToCast(
  device: CastDevice,
  status: CastStatus,
  data: CastInitData,
  force: boolean = false,
): void {
  log(`(${device.friendlyName}) URL: ` + data.url)

  if (isIdle(status)) {clearTimeout(timeoutIds[device.id]);
    timeoutIds[device.id] = setTimeout(() => {
      device.status((error, status) => {
        if (error) {
          log('Error (re-) checking status', error);
          return;
        }

        if (isIdle(status)) {
          cast(device, data);
        }
      });
    }, 5000);
  } else if (force && isRunningAutocast(status)) {
    log(`Force-relaunching autocast on ${device.friendlyName}`);
    cast(device, data);
  } else {
    log(`${device.friendlyName} is busy with ${status.applications[0].displayName}`);
  }
}

Promise.resolve(url).then(url => {
  log('Using URL:', url);

  const castInitData: CastInitData = {
    url: url
  };

  nodecastor
    .scan()
    .on('online', device => {
      log('Device online', device.id, device.friendlyName, device.address, device.port);

      device.on('connect', () => {
        device.status((error, status) => {
          if (error) {
            log('Device status error', error);
            return;
          }

          tryToCast(device, status, castInitData, true);
        });
      });

      device.on('status', status => {
        log(
          'Status changed',
          device.friendlyName,
          status.isStandby,
          (status.applications || []).map(app => app.displayName),
        );
        // When status changes, also try to cast
        // Here we must not force to allow the Cast receivers being used with other apps as well
        tryToCast(device, status, castInitData);
      });

      // Listen for error to avoid the process from exiting. Nodecastor uses the EventEmitter class from Node.js.
      // Node docs: "If an EventEmitter does not have at least one listener registered for the 'error' event, and
      // an 'error' event is emitted, the error is thrown, a stack trace is printed, and the Node.js process exits."
      device.on('error', error => {
        log('Caught error from cast device', error);
      });
    })
    .on('offline', device => {
      log('Device offline', device.friendlyName);
    })
    .start();
});
