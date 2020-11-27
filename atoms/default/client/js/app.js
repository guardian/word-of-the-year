// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"
import template from 'shared/templates/template.html'
import Ractive from 'ractive'
import Fingerprint2 from 'fingerprintjs2sync';
import wordCheck from 'shared/js/wordCheck'
import { $, $$, round, numberWithCommas, wait, getDimensions } from 'shared/js/util'
import moment from 'moment'
Ractive.DEBUG = false;

class Words {

	constructor() {

		var self = this

        this.localStorage() // Check if the user has local strorage

        this.cid = 45

        this.participated = false

        this.token = null

        this.key = "1W2KB9XWXsyLnUovMZg8n4BcaH9UoGuPWVETSnub8iwI"

        this.uid = (new Fingerprint2({ extendedJsFonts: true, excludeUserAgent: true })).getSync().fprint ;

        if (self.localstore) {

            if (localStorage.getItem('ga_poll_' + this.cid)) {

                let json = JSON.parse( localStorage.getItem('ga_poll_' + this.cid) )

                self.uid = json.uid

                self.token = json.token

                self.participated = true
  
            }

        }

        if (this.token!=null) {

            this.ractivate()

        } else {

            this.getToken()

        }

	}

    getToken() {

        var self = this

        var data = JSON.stringify({ "uid" : self.uid, "cid" : self.cid, "key" : self.key })

        var xhr = new XMLHttpRequest();

        var url = "https://pollarama.herokuapp.com/token/";

        xhr.open("POST", url, true);

        xhr.setRequestHeader("Content-type", "application/json");

        xhr.onreadystatechange = function () { 

            if (xhr.readyState == 4 && xhr.status == 200) {

                var json = JSON.parse(xhr.responseText);

                if (json.status < 70) {

                    console.log("Token " + json.token)

                    self.token = json.token

                    self.ractivate()

                }
               
            }
        }

        xhr.send(data);

    }

    localStorage() {

        var self = this

        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('verify', 'confirm');
                if (localStorage.getItem('verify') === 'confirm') {
                    localStorage.removeItem('verify');
                    //localStorage is enabled
                    self.localstore = true;
                } else {
                    //localStorage is disabled
                    self.localstore = false;
                }
            } catch(e) {
                //localStorage is disabled
                self.localstore = false;
            }
        } else {
            //localStorage is not available
            self.localstore = false;
        }
    }

	ractivate() {

		var self = this

		this.ractive = new Ractive({

			target: "#app",

			template: template,

			data: { 

                message: "",

                display: false,

                participated : self.participated,

                final : false

			}

		});

		this.ractive.on( 'submit', function ( context, index) {

            var year_2020 = $("#this-year").value;

            var year_2021 = $("#next-year").value;

            if (year_2020 != "" && year_2021 != "") {

            	if (wordCheck(year_2020, year_2021)) {

	                var obj = {}

	                obj.year_2020 = year_2020

	                obj.year_2021 = year_2021

	                obj.timestamp = moment().unix()

	                console.log(obj)

					var payload = [{ "iid" : 1, "input" : obj }]

					self.ractive.set("participated", true) ;

					self.ractive.set("final", true) ;

					self.precheck(payload)

            	} else {

            		self.ractive.set("display", true) ;

            		self.ractive.set("message", "You need to pick single words") ;

            	}

            }

		});

        this.ractive.observe( 'year1', function ( newValue ) {

            var input = newValue

            self.ractive.set("message", "") ;

            self.ractive.set("display", false) ;

        });

        this.ractive.observe( 'year2', function ( newValue ) {

            var input = newValue

            self.ractive.set("message", "") ;

            self.ractive.set("display", false) ;

        });

	}

	precheck(data) {

		var self = this

        if (self.localstore) {

            if (!localStorage.getItem('ga_poll_' + self.cid)) {

                localStorage.setItem('ga_poll_' + self.cid, JSON.stringify({ "uid" : self.uid, "cid" : self.cid, "key" : self.key, "data" : data, "token" : self.token }))

                self.postdata(data)

            } else {

                self.postdata(data)

            }

        } else {

            if (!self.participated) {

                self.postdata(data)

            }

        }

	}

    postdata(payload) {

        var self = this
        var data = JSON.stringify({ "uid" : self.uid, "cid" : self.cid, "key" : self.key, "data" : payload, "token" : self.token })
        var xhr = new XMLHttpRequest();
        var url = "https://pollarama.herokuapp.com/api/";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () { 
        	
            if (xhr.readyState == 4) {

            	self.participated = true

               
            }
        }
        xhr.send(data);
    }
}

var words = new Words()