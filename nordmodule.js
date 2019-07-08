var self = module.exports = {

  killVpn: function() {
    console.log('Killing VPN');
    var exec = require('child_process').exec;
    var child;
    child = exec('sudo ' + 'killall ' + 'openvpn',
      function (error, stdout, stderr) {
//      console.log('stdout: ' + stdout);
//      console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      }
    );
  },

  updateServers: function() {
    console.log('Getting latest config files');
    var filepath = '/usr/share/nordconnect';
    var targetDir = filepath + '/files';
    var url = 'https://downloads.nord4china.com/configs/archives/servers/ovpn.zip';
    var exec = require('child_process').exec;
    var child;
    child = exec('sudo wget -N ' + url + ' -P ' + targetDir,
      function (error, stdout, stderr) {
//      console.log('stdout: ' + stdout);
//      console.log('stderr: ' + stderr);
        var targetFile = targetDir + '/ovpn.zip';
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        else {
          console.log('Unzipping latest config files');
          child = exec('sudo unzip -q -u -o -j ' + targetFile + ' -d ' + targetDir,
            function (error, stdout, stderr) {
//            console.log('stdout: ' + stdout);
//            console.log('stderr: ' + stderr);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
            }
          )
        }
      }
    );
  },

  getServers: function(callback) {
    console.log('Getting Server list');
    var http = require('https');
    var options = {
      host: 'api.nordvpn.com',
      path: '/server'
    }
    var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        var allServers = JSON.parse(data);
        callback(allServers);
        return allServers;
      });
    });
    request.on('error', function (e) {
      console.log(e.message);
    });
    request.end();
  },

  filterServers: function(allServers, topServer) {
    console.log('Finding fastest Servers');
    var country = 'GB'
    var countryServers = allServers.filter(servers => servers.flag === country);
    var topServers = [];
    countryServers.sort(function(a, b){return a.load - b.load});
    for (i=0; i < 20; i++) {
      var server=countryServers[i];
      topServers.push(server);
    }
    topServers.sort(function(a, b){return a.id - b.id});
    for (i=0; i < 20; i++) {
      var topServer = topServers[i].domain;
    }
    console.log(topServer);
    self.connectVpn(topServer);
    return topServer;
  },

  checkServerLoad: function(allServers) {
    var fs = require('fs');
    fs.readFile('/home/pi/code/nordconnect/activeserver', function read(err, data) {
      if (err) {
        console.log('cannot read activeserver', err);
        return;
      }
      var currentServerName = data;
      var currentServerDomain = currentServerName + '.nordvpn.com';
      var currentServer = allServers.filter(servers => servers.domain === currentServerDomain);
      var load = currentServer[0].load;
//      var load = 41;
      console.log('Current server is ' + currentServerName + ' with a load of ' + load + '%');
      return load;
    });
  },

  connectVpn: function(topServer) {
    var filepath = '/usr/share/nordconnect';
    var targetDir = filepath + '/files';
    var fs = require('fs');
    if (fs.existsSync(targetDir + '/' + topServer + ".tcp.ovpn")) { 
      vpn_config_file = targetDir + '/' + topServer + ".tcp.ovpn"
      var Server = topServer.split(".");
      console.log('Connecting to ' + Server[0]);
      var exec = require('child_process').exec;
      var child = exec('sudo' + ' openvpn' + ' --redirect-gateway' + ' --auth-retry' + ' nointeract' + ' --config ' + vpn_config_file + ' --auth-user-pass ' + filepath + '/credentials' + ' --script-security' + ' 2' + ' --daemon',
//'--up', up_down_script, '--down', up_down_script, '--down-pre',
        function (error, stdout, stderr) {
//      console.log('stdout: ' + stdout);
//      console.log('stderr: ' + stderr);
          if (error !== null) {
          console.log('exec error: ' + error);
          }
          fs.writeFile('/home/pi/code/nordconnect/activeserver', Server[0], function(err, callback) {
            if (err) {
              console.log('Error saving server', err);
              return;
            }
          }); 
        }
      );
    }
  }
}
