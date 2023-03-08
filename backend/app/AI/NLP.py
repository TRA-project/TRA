import datetime

from django.db.models import Q
from similarities import Similarity

from app.models import Travel
from main import settings


class NLP_model():
    my_model = None
    last_update = None

    def my_init(self):
        if self.my_model is None:
            self.my_model = Similarity()
        if self.last_update is None:
            travels = list(Travel.objects.all().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                         visibility=settings.TRAVEL_VISIBILITIES_ALL)).values_list('id', 'content'))
        else:
            travels = list(Travel.objects.all().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                    visibility=settings.TRAVEL_VISIBILITIES_ALL)&Q(time__gt=self.last_update)).values_list('id','content'))
        strs = dict()
        for travel in travels:
            strs[travel[0]] = travel[1][:300]
        self.my_model.add_corpus(strs)
        self.last_update = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def get_similar_travels(self, src_travel):
        strs1 = src_travel
        res = self.my_model.most_similar(queries=strs1, topn=15)
        ret = []
        for q_id, c in res.items():
            for corpus_id, s in c.items():
                ret.append(corpus_id)
        return ret

    def add_travel(self, travel):
        self.my_model.add_corpus(travel)
        if self.last_update is not None:
            self.last_update = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

my_model = NLP_model()