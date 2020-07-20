from django.shortcuts import render, redirect
from ecommerce.models import retrieveProducts
from django.views import generic

class ShopView(generic.ListView):
    template_name = 'ecommerce/shop.html'
    context_object_name = 'product_list'

    def get_queryset(self):
        return retrieveProducts()


def indexPage(request):
    return render(request, 'ecommerce/index.html', {})

def logredir(request):
    return redirect('/shop')

def sayThanks(request):
    return render(request, 'ecommerce/thanks.html', {})
