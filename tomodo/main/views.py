from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader

import json
import urllib2
ITUNES_URL = "https://itunes.apple.com/search?term=%s"

from main.models import Artist, Album


# Main page (add artist tab)
def index(request):
    # Use messaging framework to display messages from actions on the main page
    message = ""
    if len(messages.get_messages(request)) > 0:
        message = [x for x in messages.get_messages(request)][0]

    artists = Artist.objects.all()
    context = { 'artists': artists, 'message' : str(message) }

    return render(request, 'main/index.html', context)

# Browse artist tab
def artist(request, artist_id = None):
    artists = Artist.objects.all()
    context = { 'artists' : artists }

    if artist_id:
        albums = Album.objects.filter(artist = artist_id)
        context.update({ 'albums': albums })

    return render(request, 'main/artist.html', context)

# Add artist action
def add_artist(request):
    # Connect to iTunes library to get artist data
    try:
        itunes_data = json.load(urllib2.urlopen(ITUNES_URL % request.POST['artist_name'].replace(' ','+')))

    # Error connecting to library
    except Exception, e:
        messages.add_message(request, messages.ERROR, str(e))
        return HttpResponseRedirect("/")

    # Process data
    else:
        # Artist found
        if itunes_data['resultCount'] > 0:
            artist, is_new = Artist.objects.get_or_create(name = itunes_data['results'][0]['artistName'])

            # New artist (doesn't exist in our DB)
            if is_new:
                for album in itunes_data['results']:
                    if album.has_key('collectionName') and album.has_key('artworkUrl100'):
                        Album.objects.get_or_create(name = album['collectionName'], image_url = album['artworkUrl100'], artist = artist)

                messages.add_message(request, messages.INFO, "All albums added")

            # Artist exists in our DB
            else:
                messages.add_message(request, messages.INFO, "Artist already in DB")

        # Artist not found
        else:
            messages.add_message(request, messages.INFO, "Artist not found")

        return HttpResponseRedirect("/")


