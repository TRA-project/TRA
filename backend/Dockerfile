FROM python:3.7

RUN mkdir /travel
WORKDIR /travel
COPY . /travel/
RUN pip install --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple -r requirements.txt

EXPOSE 8000
CMD \
    python manage.py makemigrations adminsystem app && \
    python manage.py migrate && \
    python manage.py runserver --noreload 127.0.0.1:8000
