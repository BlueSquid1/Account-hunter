import rp = require('request-promise');


export class FinderAPI{
    async GetInterest() : Promise<Array<any>> {
        let numMonths = 12;

        var options = {
            method: 'POST',
            uri: "https://www.finder.com.au/wordpress/wp-admin/admin-ajax.php",
            
            //form input parameters
            form: {
                'action': 'calculator_widget_ajax',
                'input': {
                    'type': 'high-interest-savings-account',
                    'hisaInitialDeposit': 5000,
                    'hisaMonthlyDeposit': 1000,
                    'hisaPeriod': numMonths,
                },
                'products': [ '3', '4', '5', '6', '7', '8' ],
            },
            
            //tell server this is a form submission
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },

            //return is in json format
            json: true
        };

        let savingAccounts = [];

        //send POST request to server
        let resObj = await rp(options);
        
        //for each savings account
        for(var accountId in resObj) {
            var accountArray = resObj[accountId];
            
            //get interest earnt and monthly fee
            var monthFee = 0;
            var interestEarned = 0;

            for( let itemNum in accountArray ) {
                let x = accountArray[itemNum];
                if( x.target == 'calculator-interest-earned') {
                    interestEarned = this.dollarStringToNum(x.value);
                } else if( x.target == 'calculator-monthly-fee') {
                    monthFee = this.dollarStringToNum(x.value);                    
                }
            }

            let netProfit = interestEarned - (monthFee * numMonths);
            savingAccounts.push({
                "accountId": accountId,
                "interestEarned": interestEarned,
                "monthFee": monthFee,
                "netProfit": netProfit
            });
        }

        //sort descending order by profit
        savingAccounts.sort((a,b) : number => {
            return b.netProfit - a.netProfit;
        });

        return savingAccounts;
    }

    dollarStringToNum(dollarString : string) : number {
        //remove non-number charactors
        var nonNumClearer = new RegExp('[0-9]+\.?[0-9]*');
        var numString = nonNumClearer.exec(dollarString);
        return Number(numString);
    }
}