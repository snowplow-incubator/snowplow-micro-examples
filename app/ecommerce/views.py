from django.shortcuts import render
from ecommerce.models import retrieveProducts
from django.views import generic

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