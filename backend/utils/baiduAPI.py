import requests

api_key = '4n9FbMFLfdU77lVEEtWBoFk7E3oRIEQx'
# 封装查询酒店函数
def search_hotels(location):
    # 定义请求 URL
    url = 'http://api.map.baidu.com/place/v2/search'
    # 定义搜索条件
    radius = 5000 # 搜索半径
    query = '酒店' # 搜索关键词
    tag = '星级酒店' # 搜索类别
    scope = 2 # 搜索范围，2 表示周边
    output = 'json'
    
    # 发送 HTTP 请求并解析结果
    response = requests.get(url, params = {
            'ak': api_key,
            'location': location,
            'radius': radius,
            'query': query,
            'tag': tag,
            'scope': scope,
            'output': output
    })

    result = response.json()

    # 处理查询结果
    if result['status'] == 0:
        hotels = [hotel for hotel in result['results']]
        data = []
        for hotel in hotels:
            data.append('{name} ({address}): {rating}'.format(
                name=hotel['name'],
                address=hotel['address']))
        return data
    else:
        return('查询失败，错误代码：{code}'.format(code=result['status']))
        


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
    