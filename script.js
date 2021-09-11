//testing mainnet.cash library

const inputFieldAddr = document.getElementById("inputAddr");
const button = document.getElementById("myBtn");
let addresses = [];
let texts = [];
readLocalStorage(); //look if a watchlist was already made
createListWithTemplate(addresses);

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
  let input = inputFieldAddr.value;
  inputFieldAddr.value = "";
  if (addresses.find((address) => input == address)) {
    alert("Already added this address to the watchlist!");
    return;
  }
  try {
    await Wallet.watchOnly(input);
    addresses = [...addresses, input];
    texts = [...texts, ""];
    createListWithTemplate(addresses);
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
function createListWithTemplate(addresses) {
  const Placeholder = document.getElementById("Placeholder");
  const ul = document.createElement("ul");
  ul.setAttribute("id", "Placeholder");
  const template = document.getElementById("address-template");

  addresses.forEach(async (address, index) => {
    const addressCard = document.importNode(template.content, true);
    addressCard
      .querySelector("#inputName")
      .setAttribute("id", `inputName${index}`);
    let inputFieldName = addressCard.querySelector(`#inputName${index}`);
    inputFieldName.setAttribute("onchange", `changeName(${index})`);
    inputFieldName.value = texts[index];
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
  addresses.splice(index, 1);
  texts.splice(index, 1);
  writeLocalStorage();
  createListWithTemplate(addresses);
};

// Add or Change name of an address
window.changeName = function (index) {
  let input = document.querySelector(`#inputName${index}`).value;
  localStorage.setItem(`text${index}`, input);
};

// Read Addresses and names from local storage
function readLocalStorage() {
  for (let i = 0; i < Object.keys(localStorage).length / 2; i++) {
    const localAddr = localStorage.getItem(`address${i}`);
    const localName = localStorage.getItem(`text${i}`, texts[i]);
    if (localAddr !== null) {
      addresses = [...addresses, localAddr];
      texts = [...texts, localName];
    }
  }
}

// Write Addresses and names to local storage
function writeLocalStorage() {
  localStorage.clear();
  addresses.forEach((address, index) => {
    localStorage.setItem(`address${index}`, address);
    localStorage.setItem(`text${index}`, texts[index]);
  });
}
