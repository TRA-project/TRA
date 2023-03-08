from scipy import optimize
import numpy as np

_recommend_decay_points = (
    (1.80, 0.4),
    (3.65, 0.2),
)

_recommend_init_params = np.array([-0.27621943, -0.91748966])

_recommend_decay_function = lambda X: [sum((np.exp(x * day) for x in (X + _recommend_init_params))) / X.shape[0] - decay for day, decay in _recommend_decay_points]

RECOMMEND_DECAY_PARAMS = optimize.root(_recommend_decay_function, np.zeros(len(_recommend_decay_points)))['x'] + _recommend_init_params

print(RECOMMEND_DECAY_PARAMS)
