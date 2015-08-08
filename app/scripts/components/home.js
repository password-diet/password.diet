import React from 'react';
let dwGen = require('diceware-password-generator');

window.cryptoMethod = window.crypto || window.msCrypto;

function getRandomInt(min, max) {       
    // Create byte array and fill with 1 random number
    var byteArray = new Uint8Array(1);
    window.cryptoMethod.getRandomValues(byteArray);

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
        'words': [],
        'lang': 'en'
      }
      this.handleGenerate = this.handleGenerate.bind(this);
      this.selectCountry = this.selectCountry.bind(this);
    }

    componentDidMount() {
      this.generateRandomList();
    }
    generateRandomList(lang) {
      this.setState({
        'words': dwGen({'format': 'array', 'language': lang ? lang: this.state.lang})
      });
    }

    handleGenerate(evt) {
        this.generateRandomList();
        ga('send', 'event', 'generatebutton', 'click');
    }
    

    selectWords(evt) {
        SelectText(evt.target);
        ga('send', 'event', 'text', 'clicked');
    }

    onCopyHandler(evt) {
      console.log('text copied');
      ga('send', 'event', 'text', 'copied');
    }

    selectCountry(evt) {
      var lang = evt.target.getAttribute("data-lang");
      if (lang != this.state.lang) {
        document.getElementsByClassName("img-country img-country-active")[0].className = 'img-country';
        evt.target.className = 'img-country img-country-active';
        this.setState({'lang': lang});
        this.generateRandomList(lang);
      }
      ga('send', 'event', 'select_lang', 'click', lang);
    }

  render() {
    return (       
        <div className="row">
          <div className="col-lg-8 col-lg-offset-2 text-center">
            <h3 className="well text-center password-well" onCopy={this.onCopyHandler} onClick={this.selectWords}>{this.state.words.join(" ")}</h3>
            <button type="button" className="btn btn-primary" onClick={ this.handleGenerate }><span className="glyphicon glyphicon-refresh"></span> Generate new</button>
            <div>
              <figure className="country-selector">
                <img data-lang="en" title="English" className="img-country img-country-active" onClick={this.selectCountry} src="/images/flag-usa.png" alt="Kooaburra"></img>
                <img data-lang="jp" title="Japanese" className="img-country" onClick={this.selectCountry} src="/images/flag-japan.png" alt="Pelican stood on the beach"></img>
                <img data-lang="swe" title="Swedish" className="img-country" onClick={this.selectCountry} src="/images/flag-sweden.png" alt="Cheeky looking Rainbow Lorikeet"></img>
                <figcaption>Choose your word list language</figcaption>
              </figure>
            </div>
          </div>
        </div>
    );
  }
}
