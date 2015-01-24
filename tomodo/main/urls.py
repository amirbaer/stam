from django.conf.urls import patterns, url

from main import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^artist/?$', views.artist, name='artist'),
    url(r'^artist/(?P<artist_id>\d+)/?$', views.artist, name='artist'),
    url(r'^add/?$', views.add_artist, name='add_artist'),
)

