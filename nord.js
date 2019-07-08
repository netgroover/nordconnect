var nord = require('./nordmodule.js');
const args = process.argv.slice(2)
var action = args[0];
var load = 0;

switch (action) {
  case "connect": 
    nord.killVpn();
    nord.getServers(nord.filterServers);
//    nord.getServers(nord.filterServers(nord.connectVpn));
    break;
  case "test": 
    nord.getServers(nord.checkServerLoad);
//    if (nord.checkServerload.load > 40) {
//      nord.killVpn();
//      nord.getServers(nord.filterServers);
//    }
    break;
  case "update": 
    nord.updateServers();
    break;
  case "kill": 
    nord.killVpn();
    break;
}
