//testing mainnet.cash library

const inputFieldAddr = document.getElementById("inputAddr");
const button = document.getElementById("myBtn");
let addresses=[]
let texts=[]
getCookies()

// Execute a function when the user releases a key on the keyboard
inputFieldAddr.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Trigger the button element with a click
      button.click(window.onAdd);
    }
  });

window.onAdd = async function(){
  let input=inputFieldAddr.value
  inputFieldAddr.value=''
  if(addresses.find(address => input==address)!=undefined || addresses.length>=4){return;}
  try{
    await Wallet.watchOnly(input);
    addresses=[...addresses,input]
    texts=[...texts,""]
    createListWithTemplate(addresses);
    writeCookies()
  } 
  catch(e){alert("Invalid BCH Address!")}
}

let stats=[[0.001,"36.9%"],[0.01,"21.43%"],[0.1,"8.35%"],[1,"2.69%"],[10,"0.69%"],[100,"0.08%"],[1000,"0.01%"],[10000,"0.00%"] ]

function createListWithTemplate(addresses) {
  const Placeholder=document.getElementById('Placeholder');
  const ul = document.createElement('ul');
  ul.setAttribute("id", "Placeholder");
  ul.style="display: flex;min-height: 415px;flex-wrap: wrap;"
  const template = document.getElementById('address-template');

  addresses.forEach(async (address, index) => {
    const addressCard = document.importNode(template.content, true);
    addressCard.querySelector("#inputName").setAttribute("id", `inputName${index}`);
    let inputFieldName= addressCard.querySelector(`#inputName${index}`)
    inputFieldName.setAttribute("onchange", `changeName(${index})`);
    texts[index]!=""? inputFieldName.value=texts[index]:null
    addressCard.querySelector('#x').setAttribute("onclick",`onRemove(${index})`);
    addressCard.querySelector('#addr').textContent=address
    try{
      const wallet = await Wallet.watchOnly(address);
      let {bch,usd}=await wallet.getBalance();
      let textBalance=`balance: ${bch} BCH (${usd}$)`
      addressCard.querySelector('#deposit').src = wallet.getDepositQr().src;
      addressCard.querySelector('#balance').textContent= textBalance

      let tiercount=-1
      stats.forEach(tier => {
        if(bch>tier[0]){
          tiercount++
        } else {return}
      })
      if(tiercount>=0){
        addressCard.querySelector('#richer').textContent=`only ${stats[tiercount][1]} of addresses is richer than ${stats[tiercount][0]}BCH`
      }

    } catch(e){console.log(e)}
    ul.appendChild(addressCard);
  });
  Placeholder.replaceWith(ul);
  console.log('a')
};

window.onRemove= function(index){
  addresses.splice(index, 1)
  texts.splice(index, 1)
  writeCookies();
  createListWithTemplate(addresses);
}

window.changeName= function(index){
  let input=document.querySelector(`#inputName${index}`).value
  texts[index]=[input]
  writeCookies();
}

function writeCookies(){
  for(let i=0;i<4;i++){
    document.cookie =addresses[i]==undefined? `address${i}=`:`address${i}=${addresses[i]}`
    document.cookie =texts[i]==undefined? `text${i}=`:`text${i}=${texts[i]}`
  } 
}

function getCookies(){
  if(document.cookie){
    for(let i=0;i<4;i++){
      let cookieAddr=document.cookie.match('(^|;)\\s*' + `address${i}` + '\\s*=\\s*([^;]+)')?.pop() || ''
      let cookieName=document.cookie.match('(^|;)\\s*' + `text${i}` + '\\s*=\\s*([^;]+)')?.pop() || ''
      if(cookieAddr!=""){
        addresses=[...addresses,cookieAddr]
        texts=[...texts,cookieName]
      }
    }
  writeCookies()
  createListWithTemplate(addresses);
  }
}