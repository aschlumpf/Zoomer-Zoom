# Zoomer-Zoom
CS554 (Web Programming II) Final Project

This project aims to allow users to view (mocked) stack data in real time. A user can start the program, and query for stocks by their ticker symbol or name. Users can also add stocks to a portfolio, which is held inside of a drawer that can be toggled on the left side of the screen. The portfolio displays real-time prices of all stocks within it, as well as the value of their entire portfolio. Dropdowns on the stocks within a portfolio will show additional information about that stock, such as its sector and market cap. For tracking a stock's growth in real-time, the user can select the desired stock from the search bar on the main page, and a graph for that stock will appear and update as new prices come in.

# Technology

The backend is build using three servers. One server acts to serve the queries for stock search and stock metadata. This server calls to the second server via Redis pub-sub, which essentially acts as a worker to perform a FlexSearch on all listed stocks. The third and final server delivers real-time stock prices via Socket.io. Prices for each stock change on a random interval in an attempt to emulate the real market.

The frontend is built in React.js 16 with hooks, and uses MaterialUI as the primary component framework. MaterialUI provides an easy way to make the application look modern, user-friendly, and accessible. The framework also provides APIs for component features such as lazy-loading and form control validation. 

# Running the application

To run the app, simply run the following commands in succession:

`npm install`

`npm start`

These commands will install all necessary packages for both the backend and frontend. The `start` script uses the package Concurrently in order to run all servers in one console.

# Credits

Credit to my classmate [Hari](https://github.com/Hariharan-V) for developing the backend for this project. Additionally credits to [Professor Baressi](https://github.com/philbarresi) for running a great Web Development course and providing us reference code for technologies such as Webpack, Redis, and Socket.io. 


