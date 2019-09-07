const fs = require('fs');

class MetaBank{
  constructor(url){
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
    if(url){
      let stream = fs.createReadStream(url);
      stream.on('readable', function() {
        // There is some data to read now.
        let data;
        let string = "";
        while (data = this.read()) {
          string += data;
        }
        stream.close();
      });
      this.databank= JSON.parse(string);
    }else{
      this.databank = JSON.parse(fs.readFileSync('metabank.json', 'utf8'));
    }
  }
}
module.exports = MetaBank;
