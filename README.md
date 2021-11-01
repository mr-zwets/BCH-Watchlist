A Watchlist app to track the balance of different Bitcoin Cash addresses with the option to give each one a name! It also displays how in which percentage of the richlist the address is roughly situated!

Here is the live version of the project, deployed with Netlify: [BCH Watchlist](https://bch-watchlist.netlify.app/). It uses vanilla JS for rendering.

The app uses local storage to persist the watchlist data so it's still there next time you return.

Earlier versions had two breaking changes which caused the watchlist not to be persisted locally.
- An early version used cookies but that turned out to be an inefficient solution.
- After that localstorage was used but as a seperate key value pair for each address and name.

Now it saves the watchlist as an array of address objects to localstorage with JSON stringify and JSON parse. 

Made with [Mainnet.cash](https://mainnet.cash/).
