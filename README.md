# Zoomer-Zoom
CS554 Final Project

# API Specifications for backend
## Search API
Get on /suggestions/query={query} will return a json array with stock ID, symbol, and name
for example,
/suggestions?query=micro will return
[{"_id":310,"company":"Microchip Technology","ticker":"MCHP"},{"_id":311,"company":"Micron Technology","ticker":"MU"},{"_id":312,"company":"Microsoft Corp.","ticker":"MSFT"},{"_id":9,"company":"Advanced Micro Devices Inc","ticker":"AMD"}]
It supports partial search.
## Metadata API
Get on /meta/id={id} will return a json object with stock information
for example,
/meta/id=499 returns
{"_id":499,"ticker":"XL","company":"XL Capital","sector":"Financials","open":571.2830368344222,"yield":4.638218658852664,"marketCap":14548405873.092495}
## Socket API
The backend generates made up (but stochastically accurate) stock data. But it gives only live information I.E past data is not available.
To join a channel, you join on the id, and listen on stockInfo. It will only return the current price.