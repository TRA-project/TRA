# 将adcode.json转换为适合@vant/cascader的结构

import json

adcode = {}

with open("adcode.json", "r", encoding="utf8") as f:
    adcode = json.load(f)

# 获取省份
prov_list = []
for provcode in adcode["100000"]["children"]:
    prov_dict = {}
    prov_dict["text"]  = adcode[provcode]["name"]
    prov_dict["value"] = provcode

    # 获取省内市
    city_list = []
    for citycode in adcode[provcode]["children"]:
        city_dict = {}
        city_dict["text"]  = adcode[citycode]["name"]
        city_dict["value"] = citycode
        city_list.append(city_dict) # 添加一个市信息
    
    prov_dict["children"] = city_list
    prov_list.append(prov_dict) # 添加一个省信息

with open("addr_for_cascader.json", "w", encoding="utf8") as f:
    json.dump(obj=prov_list, fp=f, ensure_ascii=False, indent=2)