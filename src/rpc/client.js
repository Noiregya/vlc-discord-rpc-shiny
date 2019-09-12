const RPC = require('discord-rpc');
const config = require('../../config/config.js');
const diff = require('../vlc/diff.js');
const format = require('./format.js');
const log = require('../helpers/lager.js');
const MetaBank = require('../helpers/metabank.js');

let loginFunction = (client) => {
  client
    .login({ clientId: config.rpc.id })
    .then(() => {
      setInterval(update, config.rpc.updateInterval);
    })
    .catch((err) => {
      throw err;
    });
}
let options = {
  hostname: config.repository.address,
  port: config.repository.port,
};

let client = new RPC.Client({ transport: 'ipc' });
let awake = true;
let timeInactive = 0;
let metabank = new MetaBank(config.repository.address, loginFunction, client);
let lastID = config.rpc.id;

/**
 * @function update
 * Responsible for updating the
   user's presence.
*/
async function update() {
  await diff(async function(status, difference) {
    if (difference) {
      const { meta } = status.information.category;
      let title = undefined;
      data = metabank.findMeta(meta.title || meta.filename);
      if(data){
        if(!meta.title){
          meta.title = data.title;
        }
        if(data.image){
          meta.image = data.image;
        }
        if(data.appid != lastID){
          lastID = data.appid;
          if(client){
            client.destroy();
          }
          client = new RPC.Client({ transport: 'ipc' });
          await client.login({ clientId: lastID })
        }
      }else if(config.rpc.id != lastID){
        lastID = config.rpc.id;
        if(client){
          client.destroy();
        }
        client = new RPC.Client({ transport: 'ipc' });
        await client.login({ clientId: lastID })
      }
      client.setActivity(format(status));
      if (!awake) {
        client.setActivity(format(status));
        awake = true;
        log('VLC updated');
        timeInactive = 0;
      }
    } else if (awake) {
      if (status.state !== 'playing') {
        timeInactive += config.rpc.updateInterval;
        if (timeInactive >= config.rpc.sleepTime || status.state === 'stopped') {
          log('VLC not playing; going to sleep.', true);
          awake = false;
          client.clearActivity();
        }
      }
    }
  });
}
