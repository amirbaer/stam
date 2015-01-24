from django.db import models


class Artist(models.Model):

    name = models.CharField(max_length = 200)

    def __str__(self):
        return self.name


class Album(models.Model):

    name = models.CharField(max_length = 200)
    image_url = models.CharField(max_length = 200)
    artist = models.ForeignKey(Artist) 

    def __str__(self):
        return "%s - %s" % (self.artist.name, self.name)


