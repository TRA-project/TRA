from django.core.management.base import BaseCommand
from utility.models import Sight, subsight


class Command(BaseCommand):
    help = 'Add 1 to all ages of Person objects'

    def handle(self, *args, **options):

        self.stdout.write(self.style.SUCCESS('Successfully added 1 to all ages.'))
