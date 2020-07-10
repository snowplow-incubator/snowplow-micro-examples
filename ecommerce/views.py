from django.shortcuts import render
from ecommerce.models import retrieveProducts, calcShippingCost
from django.views import generic
from django.http import HttpResponse

class IndexView(generic.ListView):
    template_name = 'ecommerce/index.html'
    context_object_name = 'product_list'

    def get_queryset(self):
        return retrieveProducts()


def checkout(request, subtotal = 0):
    subtotal = request.GET.get('subtotal')
    subtotal = float(subtotal)
    return render(request, 'ecommerce/checkout.html', {
        "subtotal": subtotal,
    })

def payment(request):
    # get the values from the request
    subtotal = request.GET.get('user_subtotal')
    email = request.GET.get('user_email')
    name = request.GET.get('user_name')
    surname = request.GET.get('user_surname')
    address = request.GET.get('user_address')
    city = request.GET.get('user_city')
    country = request.GET.get('user_country')

    # calculate shipping costs
    shippingCost = calcShippingCost(country)
    total = float(subtotal) + float(shippingCost)

    return render(request, 'ecommerce/payment.html', {
        "subtotal": subtotal,
        "shipping": shippingCost,
        "total": total,
        "email": email,
        "name": name,
        "surname": surname,
        "address": address,
        "city": city,
        "country": country
    })
