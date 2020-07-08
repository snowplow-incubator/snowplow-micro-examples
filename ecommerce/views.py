from django.shortcuts import render
from ecommerce.models import retrieveProducts
from django.views import generic

class IndexView(generic.ListView):
    template_name = 'ecommerce/index.html'
    context_object_name = 'product_list'

    def get_queryset(self):
        return retrieveProducts()
