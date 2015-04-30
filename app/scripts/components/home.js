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
        'words': [],
        'lang': 'swe'
      }
      this.handleGenerate = this.handleGenerate.bind(this);
      this.selectCountry = this.selectCountry.bind(this);
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

    selectCountry(evt) {
      var lang = evt.target.getAttribute("data-lang");
      if (lang != this.state.lang) {
        document.getElementsByClassName("img-country img-country-active")[0].className = 'img-country';
        evt.target.className = 'img-country img-country-active';
        this.fetchList(lang);
      }
    }

  render() {
    return (
      <div>          
        <div className="row">
          <div className="col-md-8 col-lg-8 col-sm-12 col-xs-12 col-md-offset-2 col-lg-offset-2">
            <div className="text-center">
                <h3 className="well text-center password-well" onClick={this.selectWords}>{this.state.words.join(" ")}</h3>
                <button type="button" className="btn btn-primary" onClick={ this.handleGenerate }><span className="glyphicon glyphicon-refresh"></span> Generate new</button>
                <div>
                  <figure className="country-selector">
                    <img data-lang="en" alt="English" title="English" className="img-country img-country-active" onClick={this.selectCountry} src="/images/flag-usa.png" alt="Kooaburra"></img>
                    <img data-lang="jp" alt="Japanese" title="Japanese" className="img-country" onClick={this.selectCountry} src="/images/flag-japan.png" alt="Pelican stood on the beach"></img>
                    <img data-lang="swe" alt="Swedish" title="Swedish" className="img-country" onClick={this.selectCountry} src="/images/flag-sweden.png" alt="Cheeky looking Rainbow Lorikeet"></img>
                    <figcaption>Choose your word list language</figcaption>
                  </figure>
                </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  fetchList(lang) {
      if (!lang) {
        lang = this.state.lang;
      }
      get('/diceware_' + lang +'.json').then(
        function(response) {
          this.setState({
            'diceware_list': JSON.parse(response),
            'lang': lang
          });
          this.generateRandomList();
        }.bind(this),
        function(error) {
          console.error("Failed!", error);
        }
      );
  }

  componentDidMount() {
      this.fetchList();
  }
}
