'''
    models.py

    Copyright (c) 2020-2021 Snowplow Analytics Ltd. All rights reserved.

    This program is licensed to you under the Apache License Version 2.0,
    and you may not use this file except in compliance with the Apache License Version 2.0.
    You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.

    Unless required by applicable law or agreed to in writing,
    software distributed under the Apache License Version 2.0 is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
'''


from django.db import models

# Create your models here.

class ViewProductItem:
    def __init__(self, id, sku, image_name, name, quantity, colours, price, currency):
        self.id = id
        self.sku = sku
        self.image_name = image_name
        self.name = name
        self.quantity = range(1, quantity + 1)
        self.colours = colours
        self.price = price
        self.currency = currency

productDB = [
        {"id": "1",
         "sku": "hh123",
         "image_name": "hat.jpg",
         "name": "One-size summer hat",
         "quantity": 4,
         "colours":["Black", "White"],
         "price": 15.50,
         "currency": "GBP"},
        {"id" : "2",
         "sku": "hh456",
         "image_name": "green_hat.jpg",
         "name": "One-size bucket hat",
         "quantity": 4,
         "colours":["Green", "Blue", "Yellow"],
         "price": 24.49,
         "currency": "GBP"},
        {"id":"3",
         "sku": "bb123",
         "image_name": "bag.jpg",
         "name": "Plain tote bag ",
         "quantity": 4,
         "colours":["Black", "White"],
         "price": 20.50,
         "currency": "GBP"}
    ]

def retrieveProducts():
    product_items = []
    for db_item in productDB:
        product_items.append(ViewProductItem(db_item["id"], db_item["sku"], db_item["image_name"], db_item["name"] , db_item["quantity"], db_item["colours"], db_item["price"], db_item["currency"]))
    return product_items
