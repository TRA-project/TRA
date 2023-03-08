import django_setup

import numpy as np
import pandas as pd
from functools import lru_cache as cache

from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

from django.conf import settings
from app.models import *

@cache()
def _position_adcodes():
    values = Position.objects.values_list('id', flat=True)
    return values

@cache()
def position_adcodes(truncate=4):
    values = _position_adcodes()
    return np.unique(list(map(lambda x: x[:truncate], values)))

def like_positions(user: AppUser, truncate=4, source: pd.DataFrame=None):
    liked_travels = user.first_likes()
    adcodes = position_adcodes(truncate=truncate)
    positions = liked_travels.values_list('position__position__id', flat=True)
    positions = list(map(lambda x: x[:truncate], filter(lambda x: x is not None, positions)))
    if source is None:
        source = pd.DataFrame(index=adcodes)
    positions = pd.DataFrame(pd.value_counts(positions), columns=[user.id])
    res = pd.merge(source, positions, how='left', sort=False, left_index=True, right_index=True)
    return res

def user_likes_vector():
    users = AppUser.objects.all()
    adcodes = position_adcodes(truncate=4)
    df = pd.DataFrame(index=adcodes)
    for user in users:
        df = like_positions(user, truncate=4, source=df)
    return df.fillna(0)

def user_cluster(vectors: pd.DataFrame) -> pd.DataFrame:
    """
    TODO: Using <vectors> (a column refers to a user) to cluster users
    TODO: The name of a column is field <id> of the user
    TODO: Output: a pd.DataFrame object,
    TODO:         row:    cluster id (row name: cluster_id)
    TODO:         column name: field <id> of the user
    """
    if vectors.shape[1] == 0:
        return pd.DataFrame(index=['cluster_id'])

    values = vectors.values.transpose()

    pca_dimensions = min(settings.RECOMMEND_PCA_DIMENSIONS, *vectors.shape)
    pca = PCA(pca_dimensions, copy=False, whiten=True)
    values = pca.fit_transform(values)

    kmeans = KMeans(max(round(vectors.shape[1] * settings.RECOMMEND_CLUSTER_RATIO), min(settings.RECOMMEND_CLUSTER_MINIMUM, vectors.shape[1])))
    cluster = kmeans.fit_predict(values)

    return pd.DataFrame({'cluster_id': cluster}, index=vectors.columns).transpose()

def main():
    clusters = user_cluster(user_likes_vector())
    for user_id, cluster_id in clusters.iteritems():
        cluster_id = cluster_id.cluster_id
        user = AppUser.objects.get(id=user_id)
        user.cluster = cluster_id
        user.save()
    return

if __name__ == '__main__':
    main()