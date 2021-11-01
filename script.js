//testing mainnet.cash library

const inputFieldAddr = document.getElementById("inputAddr");
const button = document.getElementById("myBtn");
let watchlist = [];
readLocalStorage(); //look if a watchlist was already made
createListWithTemplate();

// Execute a function when the user releases a key on the keyboard
inputFieldAddr.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    button.click(window.onAdd);
  }
});

// Add address to watchlist
window.onAdd = async function () {
  let newAddress = inputFieldAddr.value;
  inputFieldAddr.value = "";
  const newAddrObj = { address: newAddress, name: ""};
  if (watchlist.find( addrObj => addrObj.address === newAddress )){
    alert("Already added this address to the watchlist!");
    return;
  }
  try {
    await Wallet.watchOnly(newAddress);
    watchlist.push(newAddrObj)
    createListWithTemplate();
    writeLocalStorage();
  } catch (e) {
    alert("Invalid BCH Address!");
  }
};

// statistics on what percentage of addresses owns atleast X amount of BCH
let stats = [
  [0.001, "36.9%"],
  [0.01, "21.43%"],
  [0.1, "8.35%"],
  [1, "2.69%"],
  [10, "0.69%"],
  [100, "0.08%"],
  [1000, "0.01%"],
  [10000, "0.00%"],
];

// Display watchlist, fetch BCH and USD balances
function createListWithTemplate() {
  const Placeholder = document.getElementById("Placeholder");
  const ul = document.createElement("ul");
  ul.setAttribute("id", "Placeholder");
  const template = document.getElementById("address-template");

  watchlist.forEach(async ({address, name}, index) => {
    const addressCard = document.importNode(template.content, true);
    addressCard
      .querySelector("#inputName")
      .setAttribute("id", `inputName${index}`);
    let inputFieldName = addressCard.querySelector(`#inputName${index}`);
    inputFieldName.setAttribute("onchange", `changeName(${index})`);
    inputFieldName.value = name;
    addressCard
      .querySelector("#x")
      .setAttribute("onclick", `onRemove(${index})`);
    addressCard.querySelector("#addr").textContent = address;
    try {
      const wallet = await Wallet.watchOnly(address);
      let { bch, usd } = await wallet.getBalance();
      let textBalance = `balance: ${bch} BCH (${usd}$)`;
      addressCard.querySelector("#QR").src = wallet.getDepositQr().src;
      addressCard.querySelector("#balance").textContent = textBalance;
      let lastTier;
      stats.forEach((tier) => {
        if (bch < tier[0]) return;
        lastTier = tier;
      });
      if (lastTier !== undefined) {
        addressCard.querySelector(
          "#richer"
        ).textContent = `only ${lastTier[1]} of addresses is richer than ${lastTier[0]}BCH`;
      }
    } catch (e) {
      console.log(e);
    }
    ul.appendChild(addressCard);
  });
  Placeholder.replaceWith(ul);
}

// Remove address from watchlist
window.onRemove = function (index) {
  watchlist.splice(index, 1);
  writeLocalStorage();
  createListWithTemplate();
};

// Add or Change name of an address
window.changeName = function (index) {
  let inputName = document.querySelector(`#inputName${index}`).value;
  watchlist[index].name = inputName;
  writeLocalStorage();
};

// Read Watchlist from local storage if there is one
function readLocalStorage() {
  const localWatchlist = JSON.parse(localStorage.getItem("watchlist"))
  if(localWatchlist) watchlist = localWatchlist;
}

// Write Addresses and names to local storage
function writeLocalStorage() {
  localStorage.clear();
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}
