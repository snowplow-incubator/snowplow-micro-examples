from django.db import models

# Create your models here.

class ViewProductItem:
    def __init__(self, id, sku, image_name, description, quantity, colours, price, currency):
        self.id = id
        self.sku = sku
        self.image_name = image_name
        self.description = description
        self.quantity = range(1, quantity + 1)
        self.colours = colours
        self.price = price
        self.currency = currency

productDB = [
        {"id": "1",
         "sku": "hh123",
         "image_name": "hat.jpg",
         "description": "One-size summer hat",
         "quantity": 4,
         "colours":["Black", "White"],
         "price": 15.50,
         "currency": "GBP"},
        {"id" : "2",
         "sku": "hh456",
         "image_name": "green_hat.jpg",
         "description": "One-size bucket hat",
         "quantity": 4,
         "colours":["Green", "Blue", "Yellow"],
         "price": 24.49,
         "currency": "GBP"},
        {"id":"3",
         "sku": "bb123",
         "image_name": "bag.jpg",
         "description": "Plain tote bag ",
         "quantity": 4,
         "colours":["Black", "White"],
         "price": 20.50,
         "currency": "GBP"}
    ]

def retrieveProducts():
    product_items = []
    for db_item in productDB:
        product_items.append(ViewProductItem(db_item["id"], db_item["sku"], db_item["image_name"], db_item["description"], db_item["quantity"], db_item["colours"], db_item["price"], db_item["currency"]))
    return product_items


shipDB = {
    "UK": 10.0,
    "USA": 15.0,
    "Spain": 10.0,
    "Argentina": 15.0,
    "Mexico": 15.0,
    "Australia": 20.0,
    "China": 20.0,
    "Japan": 20.0
}

def calcShippingCost(key):
    if key in shipDB:
        return shipDB[key]
    else:
        return 5.0
