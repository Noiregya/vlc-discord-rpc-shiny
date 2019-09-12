const fs = require('fs');
const http = require('http')

class MetaBank{
  constructor(options, loginCallback, client){
    this.databank = new Object();
    this.findMeta = (title) => {
      if(title){
        let foundData = new Array();
        this.databank.forEach(data => {
          let regExp = new RegExp(data.regExp);
          if(title.toLowerCase().match(regExp)){
            foundData.push(data)
          }
        });
        if(foundData.length > 0){
          return foundData[0];
        }
      }
      return undefined;
    };
      let string = '';
      const req = http.request(options, (res) => {

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          string += chunk;
        });
        res.on('end', () => {
          try{
            this.databank = JSON.parse(string);
            loginCallback(client);
          }catch(err){
            console.error(err);
            console.error(`STATUS: ${res.statusCode}`);
            this.databank = JSON.parse(fs.readFileSync('metabank.json', 'utf8'));
            loginCallback(client);
          }
        });
      });
      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        this.databank = JSON.parse(fs.readFileSync('metabank.json', 'utf8'));
        loginCallback(client);
      });
    req.end();
  }
}
module.exports = MetaBank;
