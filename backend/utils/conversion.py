"""
This file is for function definitions.
"""
import json
import zipfile
from io import BytesIO


def get_list(data, name, err_text="require %s", err_type=None):
    """
    To get a list from request data.
    """

    def get(pname):
        res = data.get(pname)
        if res:
            return [res]
        return []

    getlist = getattr(data, "getlist", get)
    values = getlist(name) + getlist(name + '[]')
    if not values:
        if err_type:
            raise err_type(err_text % (name))
        return []
    res = []
    for value in values:
        if isinstance(value, str):
            value_list = None
            try:
                value_list = json.loads(value)
            except Exception:
                pass
            if isinstance(value_list, list):
                res.extend(value_list)
            elif value:
                res.append(value)
        elif isinstance(value, list):
            res.extend(value)
        else:
            res.append(value)
    return res


def get_bool(data, name):
    """
    To get a boolean value from data.
    """
    return to_bool(data.get(name, False))


def get_int(data, name, base=10, errtext="require %s", errtype=None):
    """
    To get an integer value from data.
    """
    try:
        res = int(data.get(name), base)
    except Exception:
        if errtype:
            raise errtype(errtext % (name))
        return None
    return res


def get_float(data, name, errtext="require %s", errtype=None):
    """
    To get an integer value from data.
    """
    try:
        res = float(data.get(name))
    except Exception:
        if errtype:
            raise errtype(errtext % (name))
        return None
    return res


def get_str(data, name, errtext="require %s", errtype=None):
    """
    To get an integer value from data.
    """
    try:
        res = str(data.get(name))
    except Exception:
        if errtype:
            raise errtype(errtext % (name))
        return None
    return res


def to_bool(value):
    """
    To convert value to bool type.
    """
    if isinstance(value, str):
        return value.lower() == "true"
    return bool(value)


def zipfile_from_data(data):
    """
    To return a zip file from byte data.
    """
    return zipfile.ZipFile(file=BytesIO(data))
