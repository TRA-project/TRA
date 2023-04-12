# Generated by Django 4.1.7 on 2023-04-04 15:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('utility', '0002_sight_rename_travelcollection_travelnotescollection_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='latitude',
            field=models.FloatField(default=0.0, null=True),
        ),
        migrations.AlterField(
            model_name='address',
            name='longitude',
            field=models.FloatField(default=0.0, null=True),
        ),
        migrations.AlterField(
            model_name='sight',
            name='address',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='utility.address'),
        ),
        migrations.AlterField(
            model_name='sight',
            name='cover',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='utility.image'),
        ),
    ]
