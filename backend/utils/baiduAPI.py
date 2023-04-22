import requests

api_key = '4n9FbMFLfdU77lVEEtWBoFk7E3oRIEQx'


def search_nearby_hotels(**kwargs):
    return search(**kwargs, query='酒店', tag='星级酒店')


def search_nearby_foods(**kwargs):
    return search(**kwargs, query='美食')


# 封装查询酒店函数
def search(**kwargs):
    # 定义请求 URL
    url = 'http://api.map.baidu.com/place/v2/search'
    # 定义搜索条件
    radius = kwargs.pop('radius', 2000)  # 搜索半径
    query = kwargs.pop('query', None)  # 搜索关键词
    tag = kwargs.pop('tag', None)  # 搜索类别
    scope = kwargs.pop('scope', 2)  # 搜索范围，2 表示周边
    output = 'json'
    location = kwargs.pop('location', None)

    params = {
        'ak': api_key,
        'location': location,
        'radius': radius,
        'query': query,
        'tag': tag,
        'scope': scope,
        'output': output
    }
    print(params)
    # 发送 HTTP 请求并解析结果
    response = requests.get(url, params=params)

    result = response.json()

    print(result)

    # 处理查询结果
    if result['status'] == 0:
        return result['results']
    else:
        return '查询失败，错误代码：{code}'.format(code=result['status'])


def search_driving_route(origin, destination, waypoints):
    url = 'https://api.map.baidu.com/directionlite/v1/driving'
    params = {
        "ak": api_key,
        "origin": origin,
        "destination": destination,
        "waypoints": waypoints,
        "output": "json"
    }

    # send the API request and parse the response
    response = requests.get(url, params=params)
    data = response.json()

    # check if the API returned an error message
    if data["status"] != 0:
        return {"error": f"API returned status code {data['status']} with message '{data['message']}'"}

    # return the driving route information as a dictionary
    return data
