from django.db import models

class Scenic(models.Model):
    name = models.CharField(max_length=16)
    province = models.IntegerField()
    city = models.IntegerField()
    district = models.IntegerField()
    address = models.CharField(max_length=64)
    longitude = models.DecimalField(max_digits=10, decimal_places=6)
    latitude = models.DecimalField(max_digits=10, decimal_places=6)
    introduce = models.TextField()
    hot = models.FloatField()
    grade = models.FloatField()
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    playtime = models.FloatField()

    class Meta:
        db_table = 'location'



class Sight(models.Model):
    sight = models.ForeignKey(Scenic, on_delete=models.CASCADE)
    name = models.CharField(max_length=16, null=False)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True)
    introduce = models.TextField(null=True)