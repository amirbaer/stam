from django.shortcuts import render, get_object_or_404

from django.http import HttpResponse
from django.template import RequestContext, loader

from main.models import Artist, Album

def index(request):
    artists = Artist.objects.all()
    context = { 'artists': artists }
    return render(request, 'main/index.html', context)

def artist(request, artist_id):
    albums = Album.objects.filter(artist = artist_id)
    context = { 'albums': albums }
    return render(request, 'main/artist.html', context)

def add_artist(request):
    #p = get_object_or_404(Question, pk=question_id)
    print "slowwww"
    try:
        return HttpResponse("ok - %s" % request.POST['artist_name'])
    except KeyError:
        # Redisplay the question voting form.
        return render(request, 'main/index.html', {
            'error_message': "something bad",
        })
    else:
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse('main:index'))


