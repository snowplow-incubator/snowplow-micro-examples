from django.db import models

# Create your models here.

class ViewProductItem:
    def __init__(self, id, image_name, description, quantity, colours, price, currency):
        self.id = id
        self.image_name = image_name
        self.description = description
        self.quantity = range(quantity + 1)
        self.colours = colours
        self.price = price
        self.currency = currency

productDB = [
        {"id": "1",
        "image_name": "hat.jpg",
         "description": "One-size summer hat",
         "quantity": 4,
         "colours":["Black", "White"],
         "price": 15.50,
         "currency": "GBP"},
        {"id" : "2",
        "image_name": "green_hat.jpg",
         "description": "One-size bucket hat",
         "quantity": 4,
         "colours":["Green", "Blue", "Yellow"],
         "price": 24.49,
         "currency": "GBP"},
        {"id":"3",
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
        product_items.append(ViewProductItem(db_item["id"], db_item["image_name"], db_item["description"],
         db_item["quantity"], db_item["colours"], db_item["price"], db_item["currency"]))
    return product_items





