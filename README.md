# Account Hunter

### Introduction
This is a web scrapper for www.finder.com.au. I created this web scrapper because I wanted to find out what were the best savings accounts avaliable across all australian banks.

### Background
www.finder.com.au has one of the largest collections of savings accounts that are updated/maintained on a daily basics in Australia. The team at www.finder.com.au have already done the hard work and implemented logic that will calculate how much money each bank account will make for a given period of time and initial amount of money. Unfortunately they don't provide any functionality to list which bank accounts will generate the most interest. Instead they have a "Savings Account Finder" which shows you only a small range of selected bank accounts which are typically competitive however not necessarily the best. This is why I create this repository, to find the best savings accounts based on the amount of interested earned across all savings accounts listed on www.finder.com.au.

### Dependancies
The backend logic is written in typescript which is then translated and ran on a node.js server. Bootstrap and jquery where used on the frontend.

You will need to install the following libraries/tools for the backend server:
1. Node.js: https://nodejs.org/en/
2. Typescript: https://www.typescriptlang.org/

### Results
So what are the best savings accounts? Check out my server which is running the code on this repository:
http://accounthunter.azurewebsites.net/views/landingPage.html

### How do I run this code for my own personal use?
This code repository was designed to automatically be deployed to any Microsoft Azure App Service. Simply create a new Azure App Service (free-tier is fine) and then under the deployment options specify the master branch of this Github repository.

However, if you would prefer to run a local instance of this code without creating a Microsoft Azure account then follow the steps listed below:

1. Download all node.js dependencies:
```
npm install --production
```

2. Translate all typescript files (.ts) to javascript files (.js):
```
tsc
```

3. launch the node.js server:
```
node index.js
```