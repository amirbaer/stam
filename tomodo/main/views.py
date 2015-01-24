from django.shortcuts import render, get_object_or_404

from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader

import json
import urllib2
ITUNES_URL = "https://itunes.apple.com/search?term=%s"

from main.models import Artist, Album

def index(request):
    artists = Artist.objects.all()
    context = { 'artists': artists }
    return render(request, 'main/index.html', context)

def artist(request, artist_id = None):
    artists = Artist.objects.all()
    context = { 'artists' : artists }

    if artist_id:
        albums = Album.objects.filter(artist = artist_id)
        context.update({ 'albums': albums })

    return render(request, 'main/artist.html', context)

def add_artist(request):
    try:
        itunes_data = json.load(urllib2.urlopen(ITUNES_URL % request.POST['artist_name'].replace(' ','+')))

    except Exception, e:
        # Redisplay the question voting form.
        return render(request, 'main/index.html', {
            'error_message': str(e),
        })

    else:

        if itunes_data['resultCount'] > 0:
            artist, is_new = Artist.objects.get_or_create(name = itunes_data['results'][0]['artistName'])

            if is_new:
                for album in itunes_data['results']:
                    Album.objects.get_or_create(name = album['collectionName'], image_url = album['artworkUrl100'], artist = artist)

                return HttpResponse("All albums added")

            else:
                return HttpResponse("Artist already in DB")
        else:
            return HttpResponse("Artist not found")


