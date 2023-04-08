# Generated by Django 4.1.7 on 2023-04-05 08:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('utility', '0004_alter_sight_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='price',
            name='sight',
        ),
        migrations.RemoveField(
            model_name='price',
            name='subsight',
        ),
        migrations.AddField(
            model_name='sight',
            name='price_list',
            field=models.ManyToManyField(null=True, to='utility.price'),
        ),
    ]