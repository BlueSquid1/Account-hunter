$('#loading-image').show();

$.ajax({
    url: '../savingAccounts',
    success: function (accountsArray) {
        //for each bank account
        for (var accountIndex in accountsArray) {
            var accountObj = accountsArray[accountIndex];

            var accountRow = $('<tr></tr>');

            accountRow.append($('<th></th>').addClass('text-center').text(Number(accountIndex) + 1));
            accountRow.append($('<td></td>').addClass('text-center').text(accountObj["accountName"]));
            accountRow.append($('<td></td>').addClass('text-center').text(accountObj["interestEarned"]));
            accountRow.append($('<td></td>').addClass('text-center').text(accountObj["maxVarInterestRate"]));
            accountRow.append($('<td></td>').addClass('text-center').text(accountObj["standardInterestRate"]));
            accountRow.append($('<td></td>').addClass('text-center').text(accountObj["monthlyFees"]));
            accountRow.append($('<td></td>').addClass('text-center').text(accountObj["minOpeningDeposit"]));

            var urlLink = $('<a></a>').attr('href', accountObj["moreDetailsurl"]);
            urlLink.addClass('text-center').text("details");
            accountRow.append($('<td></td>').append(urlLink));

            $("table#savingAccountsTb tbody").append(accountRow);
        }
    },
    complete: function () {
        $('#loading-image').hide();
    }
});