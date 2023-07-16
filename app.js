
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");
const input = document.getElementById("search");
const listSearch = document.querySelector(".list-search");
const btnFilter = document.querySelectorAll(".btn-cat");


//cart
let cart = [];

//buttons
let buttonsDOM = [];

productsDom.innerHTML
//getting the productsDom
class Products {
  async getProducts() {
    try {
      let result =await fetch ("products.json");
      let data =await  result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price,category } = item.fields;
        const { id } = item.sys;
        const { url } = item.fields.image.fields.file;
        return { title, price, id, url,category };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// UI for displaying products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
      <article class="product">
        <div class="img-container">
          <img
            src=${product.url}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i> add to cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      `;
    });
    productsDom.innerHTML = result;
  }


  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => item.id === id);

      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      } else {
        btn.addEventListener("click", event => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // add product to the cart
          cart = [...cart, cartItem];
          // save cart in localStorage
          Storage.saveCart(cart);
          // set cart values
          this.setCartValues(cart);
          // display cart items
          this.addCartItem(cartItem);
          // show the cart and create an overlay
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  








  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.url} alt=""/>
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  
  
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // cart functionality
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let btn = this.getSingleButton(id);
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(btn => btn.dataset.id === id);
  }
  searchLogic(){
    input.addEventListener("input",(e)=>{
     
      this.searchfunc(e.target.value.toLowerCase(),JSON.parse(localStorage.getItem('products')));
    })
  
    }
  

  searchfunc(title,myArray){
    
    let arr = myArray.filter((item)=> item.title.includes(title.toLowerCase()));
    let result = "";
    arr.forEach(item => {
      result += `
      <li class="list-item" value="${item.title}">${item.title}</li>
      `;
    });
    listSearch.innerHTML = result;

    input.addEventListener("keyup",(e)=>{

      if(e.keyCode === 13 ){ this.displayProducts(arr)}
     if(e.target.value==""){
      listSearch.classList.remove('show-list');
      this.displayProducts(JSON.parse(localStorage.getItem('products')))
     }
     if(e.target.value!=""){
      listSearch.classList.add('show-list');
     }
    })
    
    const listSearchItem = document.querySelectorAll(".list-item");

    listSearchItem.forEach((item)=>{item.addEventListener("click",()=>{
        input.value=item.innerHTML;
        listSearch.classList.remove('show-list');
        this.searchfunc(item.innerHTML,JSON.parse(localStorage.getItem('products')));
      
    })  })

    }
    filterlogic(){
      btnFilter.forEach((item)=> {item.addEventListener("click",()=>{
        if(item.innerHTML=="All"){
          this.displayProducts(JSON.parse(localStorage.getItem('products')))
        }else {
            this.filterfun(item.innerHTML,JSON.parse(localStorage.getItem('products')));
            
          
        }

      
      })})
    } 
    filterfun(category,myArray){
      let arr = myArray.filter((item)=> item.category === category);
      this.displayProducts(arr);
    }
    
  
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new UI();
  //setup application
  ui.setupAPP();
  //get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
      ui.searchLogic();
      ui.filterlogic();
    });
});
