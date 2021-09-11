//testing mainnet.cash library

const inputFieldAddr = document.getElementById("inputAddr");
const button = document.getElementById("myBtn");
let addresses = [];
let texts = [];
readLocalStorage();
createListWithTemplate(addresses);

// Execute a function when the user releases a key on the keyboard
inputFieldAddr.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    button.click(window.onAdd);
  }
});

window.onAdd = async function () {
  let input = inputFieldAddr.value;
  inputFieldAddr.value = "";
  if (addresses.find((address) => input == address)) {
    alert("Already added this address to the watchlist!");
    return;
  }
  if (addresses.length >= 4) {
    alert("Already added the maximum number of addresses to watchlist");
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

      let tiercount = -1;
      stats.forEach((tier) => {
        if (bch > tier[0]) {
          tiercount++;
        } else {
          return;
        }
      });
      if (tiercount >= 0) {
        addressCard.querySelector(
          "#richer"
        ).textContent = `only ${stats[tiercount][1]} of addresses is richer than ${stats[tiercount][0]}BCH`;
      }
    } catch (e) {
      console.log(e);
    }
    ul.appendChild(addressCard);
  });
  Placeholder.replaceWith(ul);
}

window.onRemove = function (index) {
  addresses.splice(index, 1);
  texts.splice(index, 1);
  writeLocalStorage();
  createListWithTemplate(addresses);
};

window.changeName = function (index) {
  let input = document.querySelector(`#inputName${index}`).value;
  texts[index] = [input];
  writeLocalStorage();
};

function readLocalStorage() {
  for (let i = 0; i < 4; i++) {
    const localAddr = localStorage.getItem(`address${i}`);
    const localName = localStorage.getItem(`text${i}`, texts[i]);
    if (localAddr !== null) {
      addresses = [...addresses, localAddr];
      texts = [...texts, localName];
    }
  }
}

function writeLocalStorage() {
  for (let i = 0; i < addresses.length && i < 4; i++) {
    localStorage.setItem(`address${i}`, addresses[i]);
    localStorage.setItem(`text${i}`, texts[i]);
  }
}
