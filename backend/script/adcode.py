# -*- coding: utf-8 -*-
# @Time    : 2023/4/5 下午3:28
# @Author  : Su Yang
# @File    : adcode.py
# @Software: PyCharm 
# @Comment :
import json


def add_father_filed():
    """
    为adcode.json添加father字段
    :return:
    """
    with open('adcode.json', 'r', encoding='utf8') as f:
        ADCODE = json.load(f)
    province_adcode_list = ADCODE['100000']['children']
    for province_adcode in province_adcode_list:
        province_dict = ADCODE[province_adcode]
        province_dict['father'] = '100000'
        city_adcode_list = province_dict['children']
        for city_adcode in city_adcode_list:
            city_dict = ADCODE[city_adcode]
            city_dict['father'] = province_adcode
            district_adcode_list = city_dict['children']
            for district_adcode in district_adcode_list:
                district_dict = ADCODE[district_adcode]
                district_dict['father'] = city_adcode
    with open("json_value_change.json", "w", encoding='utf8') as f:
        json.dump(obj=ADCODE, fp=f)


if __name__ == '__main__':
    add_father_filed()
