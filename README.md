# Data Analysis Website

![Preview](https://github.com/MagorTuga/DataAnalysisWebsite/blob/main/preview.png?raw=true)

Website used to analyze completed transactions over time by scraping eBay's search queries.

Developed using Node.js, HTML, Javascript, PHP, and MySQL.

To host, create database with provided query, install Node.js and required modules, then run scrapper.js with node. Website host is set to port 500.

This was created with the intent of giving users a better understanding of how much they should be willing to pay for graphics cards, given the current market. However, any type of listing is supported. The original idea behind this project was that at the time retail prices were too high to be considered competitive, and "scalpers" would exploit the situation by artificially inflating prices, even on used graphics cards, so only confirmed sold listings are used, as to better understand what prices people are willing to pay for an item.

Due to eBay's constantly changing policies surrounding their API costs and usage, this is but a proof of concept, as data can only be collected by searching it in the first place. No data is collected automatically.

# Functionality

Simply type a search string with the desired configuration into the search bar and confirm.

However, the search must be made multiples times over a long period of time in order to properly visualize relevant price trends.
