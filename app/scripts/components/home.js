import React from 'react';

function getRandomInt(min, max) {       
    // Create byte array and fill with 1 random number
    var byteArray = new Uint8Array(1);
    window.crypto.getRandomValues(byteArray);

    var range = max - min + 1;
    var max_range = 256;
    if (byteArray[0] >= Math.floor(max_range / range) * range)
        return getRandomInt(min, max);
    return min + (byteArray[0] % range);
}

function diceRoll() {
    return getRandomInt(1, 6);
}

function diceSeq(count) {
    var seq = [];
    for(var i=0; i<count; i++) {
        seq.push(diceRoll())
    }
    return seq.join("");
}

function getDices() {
    return diceSeq(5);
}

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function SelectText(element) {
    var range,
        selection;
    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();        
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}



export default class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        'diceware_list': {},
        'words': []
      }
      this.handleGenerate = this.handleGenerate.bind(this);
    }
    getRandomList() {
        var words = [];
        for(var i=0; i<6; i++) {
            words.push(this.state.diceware_list[getDices()]);
        }
        return words;
    }

    generateRandomList() {
      this.setState({
        'words': this.getRandomList()
      });
    }

    handleGenerate(evt) {
        this.generateRandomList();
    }
    

    selectWords(evt) {
        SelectText(evt.target);
    }

  render() {
    return (
      <div>
        <h1 className="text-center">Secure <a href="http://en.wikipedia.org/wiki/Diceware">diceware</a> passwords for you</h1>
                
            
        <div className="text-center">
            <h3 className="well text-center" onClick={this.selectWords}>{this.state.words.join(" ")}</h3>
            <button type="button" className="btn btn-primary" onClick={ this.handleGenerate }><span className="glyphicon glyphicon-refresh"></span> Generate</button>
        </div>
      </div>
    );
  }

  componentDidMount() {
      var that = this;
      get('/diceware.json').then(function(response) {
          that.setState({
            'diceware_list': JSON.parse(response)
          });
          that.generateRandomList();
      }, function(error) {
        console.error("Failed!", error);
      });
    }
}
