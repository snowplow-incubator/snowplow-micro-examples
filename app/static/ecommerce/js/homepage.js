// userCart = [ {itemSku:sku, itemTitle:title, itemPrice: price, itemQuant:quantity},... ]
let userCart = [];

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    let removeCartItemButtons = document.getElementsByClassName('btn-danger');
    for (let i = 0; i < removeCartItemButtons.length; i++) {
        let button = removeCartItemButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    let quantityInputs = document.getElementsByClassName('cart-quantity-input');
    for (let i = 0; i < quantityInputs.length; i++) {
        let input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    let addToCartButtons = document.getElementsByClassName('shop-item-button');
    for (let i = 0; i < addToCartButtons.length; i++) {
        let button = addToCartButtons[i];
        button.addEventListener('click', addToCartClicked);
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', toThanks);

};

function removeCartItem(event) {
    let buttonClicked = event.target;
    let cartItem = buttonClicked.parentElement.parentElement;

    let title = cartItem.getElementsByClassName('cart-item-title')[0].innerText;
    let price = cartItem.getElementsByClassName('cart-price cart-column')[0].innerText.replace(/[^\d.-]/g, '');
    let quantity = cartItem.getElementsByClassName('cart-quantity-input')[0].value;
    let sku = cartItem.getElementsByClassName('cart-item-sku')[0].innerText;

    // cart_action_event
    window.snowplow('trackSelfDescribingEvent',
                    {
                        schema: 'iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0',
                        data: {
                            type: "remove"
                            }
                    },
                    [ {
                        schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                        data: {
                            sku: sku,
                            name: title,
                            price : parseFloat(price),
                            quantity : parseInt(quantity)
                        }
                    } ]
                   )

    // remove the item also from userCart (assuming there is a single item to be removed)
    userCart.forEach( function (elt, idx) {
        if ( sku === elt['itemSku'] ) {
            userCart.splice(idx, 1);
        }
    })

    buttonClicked.parentElement.parentElement.remove();

    updateCartTotal();
};

function quantityChanged(event) {
    let input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateCartTotal();
};

function addToCartClicked(event) {
    let button = event.target;
    let shopItem = button.parentElement.parentElement.parentElement;
    let title = shopItem.getElementsByClassName('product-title')[0].innerText;

    let price = shopItem.getElementsByClassName('product-price')[0].innerText.replace(/[^\d.-]/g, '');
    let imageSrc = shopItem.getElementsByClassName('product-img')[0].src;

    let quantity = shopItem.getElementsByClassName('cart-quantity-input')[0].value;
    quantity = quantity ? quantity : 1;

    let sku = shopItem.getElementsByClassName('product-sku')[0].innerText;
    let id = shopItem.getElementsByClassName('product-id')[0].innerText;

    addItemToCart(title, price, imageSrc, quantity, sku, id);
    updateCartTotal();
};

function addItemToCart(title, price, imageSrc, quantity, sku, id) {
    let cartRow = document.createElement('div');
    cartRow.classList.add('cart-row');
    let cartItems = document.getElementsByClassName('cart-items')[0]
    let cartItemNames = cartItems.getElementsByClassName('cart-item-title');
    for (let i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText === title) {
            alert('This item is already added to the cart');
            return;
        }
    }
    let cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
            <span class="cart-item-sku" style="display:none">${sku}</span>
        </div>
        <span class="cart-price cart-column">£ ${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="${quantity ? quantity : 1}" test-id="cart-change-quant-${id}">
            <button class="btn btn-danger" type="button" test-id="rem-btn-${id}">REMOVE</button>
        </div>`;
    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow);
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem);
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged);

    userCart.push({
        itemTitle: title,
        itemPrice: parseFloat(price),
        itemQuant: quantity === "" ? 1 : parseInt(quantity),
        itemSku : sku
    });

    // cart_action_event
    window.snowplow('trackSelfDescribingEvent',
                    {
                        schema: 'iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0',
                        data: {
                            type: "add",
                        }
                    },
                    [ {
                        schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                        data: {
                            sku: sku,
                            name: title,
                            price: parseFloat(price),
                            quantity: parseInt(quantity)
                        }
                    } ]
                   );

};


function updateCartTotal() {
    let cartItemContainer = document.getElementsByClassName('cart-items')[0];
    let cartRows = cartItemContainer.getElementsByClassName('cart-row');
    let total = 0;
    for (let i = 0; i < cartRows.length; i++) {
        let cartRow = cartRows[i];
        let priceElement = cartRow.getElementsByClassName('cart-price')[0];
        let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
        let price = parseFloat(priceElement.innerText.replace(/[^\d.-]/g, ''));
        let quantity = quantityElement.value;
        total = total + (price * quantity);

        let title = cartRow.getElementsByClassName('cart-item-title')[0];

        // also update userCart just in case quantity changed
        userCart.forEach( function (elt) {
            if (title.innerText === elt['itemTitle']) {
                elt['itemQuant'] = parseInt(quantity);
            }
        });
    }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('cart-total-price')[0].innerText = '£' + total;
};

function toThanks () {
    if (userCart.length === 0) {
        alert("No items in your basket");
        return;
    } else {
        // create the contexts array
        let productsContext = [];
        userCart.forEach( function (elt) {
            productsContext.push({
                schema: 'iglu:test.example.iglu/product_entity/jsonschema/1-0-0',
                data: {
                    sku: elt['itemSku'],
                    name: elt['itemTitle'],
                    price: parseFloat(elt['itemPrice']),
                    quantity : elt['itemQuant']
                }
            })
        });

        let total = document.getElementsByClassName('cart-total-price')[0].innerText.replace(/[^\d.-]/g, '');

        // purchase_event
        window.snowplow('trackSelfDescribingEvent',
                        {
                            schema: 'iglu:test.example.iglu/purchase_event/jsonschema/1-0-0',
                            data : {
                                total : parseFloat(total)
                            }
                        },
                        productsContext);

        window.location.href = 'http://' + window.location.host + '/thanks/';
    }
};

// helpers
function toUrlParams (obj) {
    let urlParams = new URLSearchParams(obj);

    return urlParams.toString();
};
