# Zoomer-Zoom
CS554 Final Project

# API Specifications for backend
## Search API
Get on /suggestions?query={query} will return a json array with stock ID, symbol, and name
for example,
/suggestions?query=micro will return
[{
    _id: 101,
    Symbol: MSFT,
    Company: Microsoft
},
{
    _id:100,
    Symbol: MCP,
    Company: Microchip Technology
}
]
It supports partial search.
## Metadata API
Get on /meta?id={id} will return a json object with stock information
## Socket API
The backend generates made up (but stochastically accurate) stock data. But it gives only live information I.E past data is not available.
To join a channel, you join on the id, and listen on stockInfo. It will only return the current price.