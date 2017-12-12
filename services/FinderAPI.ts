import rp = require('request-promise');
import cheerio = require('cheerio');
import fs = require('fs');

export class FinderAPI{
    accountBuffer = [];
    previousDay;
    verbose = false;

    async GetInterestAccounts():  Promise<Array<any>> {
        if(this.verbose == true) {
            console.debug("Call to get interest accounts");
        }
        
        let time = new Date();
        let dayNum = time.getDay();
        let expired = (dayNum != this.previousDay); 
        
        if( (this.accountBuffer.length == 0) || (expired == true) ) {
            //refresh buffered copy
            if(this.verbose == true) {
                console.debug("expired copy in buffer. Retrieving latest interest accounts");
            }
            let numMonths = 24;
            let intialDeposit = 5000;
            let monthlyDeposit = 1000;
            this.accountBuffer = await this.RefreshInterestAccounts(numMonths, intialDeposit, monthlyDeposit);
            this.previousDay = time.getDay();
        }

        return this.accountBuffer;
    }
    
    async RefreshInterestAccounts(numMonths: number, intialDeposit: number, monthlyDeposit: number): Promise<Array<any>> {
        let options = {
            method: 'POST',
            uri: "https://www.finder.com.au/wordpress/wp-admin/admin-ajax.php",
            
            //form input parameters
            form: {
                'action': 'calculator_widget_ajax',
                'input': {
                    'type': 'high-interest-savings-account',
                    'hisaInitialDeposit': intialDeposit,
                    'hisaMonthlyDeposit': monthlyDeposit,
                    'hisaPeriod': numMonths,
                },
                'products': [ '*' ],
            },
            
            //tell server this is a form submission
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },

            //return is in json format
            json: true
        };

        let savingAccountIDs: Array<accountID> = [];

        if(this.verbose == true) {
            console.debug("Sending request to finder.com.au, This can take a minute...");
        }
        //send POST request to server
        let resObj = await rp(options);

        //for each savings account
        let accountCounter = 0;
        for( let accountId in resObj) {
            let accountArray = resObj[accountId];
            
            //get interest earnt and monthly fee
            let monthFee = 0;
            let interestEarned = 0;

            for( let itemNum in accountArray ) {
                let x = accountArray[itemNum];
                if( x.target == 'calculator-interest-earned') {
                    interestEarned = this.dollarStringToNum(x.value);
                } else if( x.target == 'calculator-monthly-fee') {
                    monthFee = this.dollarStringToNum(x.value);                    
                }
            }

            let netProfit = interestEarned - (monthFee * numMonths);
            savingAccountIDs.push({
                "accountId": Number(accountId),
                "interestEarned": interestEarned,
                "monthFee": monthFee,
                "netProfit": netProfit
            });

            accountCounter++;
        }

        if(this.verbose == true) {
            console.debug("retrieved " + accountCounter + " accounts");
        }

        //sort descending order by profit
        savingAccountIDs.sort((a,b) : number => {
            return b.netProfit - a.netProfit;
        });

        let savingAccountDetails = await this.GetDetailsForAccounts(savingAccountIDs);

        return savingAccountDetails;
    }

    async GetDetailsForAccounts(savingAccountIDs : Array<accountID>) : Promise<Array<any>> {
        let accountIDs : Array<string> = [];
        //get up to 60 accounts
        let totalAccounts = 60;
        for(let i = 0; i < Math.min(totalAccounts, savingAccountIDs.length); i++) {
            accountIDs.push(String(savingAccountIDs[i].accountId));
        }

        let options = {
            uri: "https://www.finder.com.au/wordpress/wp-admin/admin-ajax.php",
            
            //GET parameters
            qs: {
                'action': 'get_compareInfobox_modal_ajax',
                'id': accountIDs,
                'site': 'www.savingsaccountfinder.com.au',
            }
        };

        //send GET request to server
        let htmlResponse = await rp(options);

        //can then use cheerio to scrap data from html response
        let $ = cheerio.load(htmlResponse);
        
        let bankAccountDetails = [];

        //get table rows
        let table = $('table.i_infobox tbody');

        //map html text to attribute names
        let mappingJson = await this.readFileAsync('services/finderMapper.json');
        let textMapper = JSON.parse(mappingJson);
        
        //handle first row
        let firstRow = $(table).children('tr').first();
        $(firstRow).children('td').each(function(i, elem) {
            let accountName = String($(elem).children().last().text());
            bankAccountDetails.push( { 
                'accountName': accountName,
                'interestedEarned': '$' + savingAccountIDs[i].interestEarned
            });
        });

        //loop through all but the last table row
        $(table).children('tr').slice(1, -1).each( function(i, elem) {
            //get attribute name
            let htmlText: string = String($(elem).children('th').text());
            
            let attributeName = '';
            if(textMapper.hasOwnProperty(htmlText)) {
                attributeName = textMapper[htmlText];
            } else {
                attributeName = htmlText;
            }


            //add attribute to all bank accounts
            let banksArray = $(elem).children('td').toArray();
            if( banksArray.length != bankAccountDetails.length ) {
                throw new Error("web scrapper failed. columns in table body does not equal number of known bank accounts.");
            }
            for(let bankIndex in banksArray) {
                let value = String($(banksArray[bankIndex]).text());
                bankAccountDetails[bankIndex][attributeName] = value;
            }
        });

        //handle last row
        let lastRow = $(table).children('tr').last();
        if($(lastRow).children('td').length != bankAccountDetails.length) {
            throw new Error("web scrapper failed. columns in table last row does not equal number of known bank accounts.");
        }

        $(lastRow).children('td').each(function(i, elem) {
            let accountUrl = String($(elem).children('a').last().attr('href'));
            bankAccountDetails[i]['moreDetailsurl'] = accountUrl;
        });

        //filter out invalid accounts
        bankAccountDetails = bankAccountDetails.filter( function(item) {
            return item.accountName != "";
        });

        //remove accounts with same account name used a 'hash table'
        let seen : Object = { };
        bankAccountDetails = bankAccountDetails.filter( function(item) {
            if(seen.hasOwnProperty(item.accountName) == false)
            {
                seen[item.accountName] = true;
                return true;
            }
            return false;
        });

        //return the top 40 accounts
        let numAccountsToReturn = 40;
        return bankAccountDetails.splice(0,numAccountsToReturn);
    }

    dollarStringToNum(dollarString : string) : number {
        //remove non-number charactors
        let nonNumClearer = new RegExp('[0-9]+\.?[0-9]*');
        let numString = nonNumClearer.exec(dollarString);
        return Number(numString);
    }

    // useful util to read a file
    readFileAsync(filename) : Promise<string> {
        return new Promise(function (resolve, reject) {
            try {
                fs.readFile(filename, 'utf8', function(err, data) {
                    if (err) reject(err); else resolve(data);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

class accountID {
    constructor(public accountId: number, public interestEarned: number, public monthFee: number, public netProfit: number) {
    }
}