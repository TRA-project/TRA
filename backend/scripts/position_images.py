import django_setup

import os
from django.core.files import File

from app.models import Position, Image
from app.serializers import ImageSerializer

def main():
    os.chdir('position_images')
    try:
        for folder in os.listdir():
            pos = Position.objects.filter(name__contains=folder)
            if not pos: continue
            pos = pos.first()
            os.chdir(folder)
            try:
                has_cover = False
                pos.images.clear()
                for img in os.listdir():
                    with open(img, 'rb') as f:
                        image = ImageSerializer(data={
                            'image': File(f),
                        })
                        image.is_valid(raise_exception=True)
                        image = image.save()
                    if not has_cover:
                        name, ext = os.path.splitext(img)
                        if name == '0':
                            has_cover = True
                            pos.cover = image
                            pos.save()
                            continue
                    pos.images.add(image)
            finally: os.chdir('..')
    finally: os.chdir('..')

if __name__ == '__main__':
    main()
