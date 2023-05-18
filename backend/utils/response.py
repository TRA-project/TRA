from rest_framework.response import Response
from rest_framework.views import exception_handler as _eh
from rest_framework import status


class Error:
    SUCCESS = 200

    INTERNAL_ERROR = 500

    PARSE_ERROR = 400

    USER_INCORRECT_PASSWORD = 600
    USER_NAME_ALREADY_EXISTS = 601
    USER_INVALID_WECHAT_CODE = 602
    USER_INVALID_WECHAT_ID = 603
    INVALID_USER = 604
    NOT_LOGIN = 605

    COMPANION_CANNOT_REMOVE = 620
    COMPANION_ALREADY_FULL = 621
    COMPANION_CANNOT_JOIN = 622
    COMPANION_IS_OWNER = 623
    COMPANION_DEADLINE_REACHED = 624

    ADMIN_MESSAGE_TIME_LIMIT = 640

    SCHEDULE_NOT_OFFER = 660
    SCHEDULE_UNREACHABLE = 661
    SCHEDULE_OVERSTEP = 662
    SCHEDULE_DATE_OVERSTEP = 663
    SCHEDULE_OVERLAP = 664

    USERS_FLIGHT_EXISTS = 680

    COLLECTION_NO_TITLE = 700
    COLLECTION_TITLE_DUPLICATED = 701
    COLLECTION_TITLE_UNCHANGEABLE = 702
    COLLECTION_TITLE_UNDELETED = 703

    TRAVEL_NO_CONTENT = 800

    NO_PLAN = 900


STATUS_CODE_MAP = {
    status.HTTP_400_BAD_REQUEST: Error.PARSE_ERROR,
}


def response(payload=[], code=Error.SUCCESS, status=200, headers={}, **kwargs):
    payload = {
        **kwargs,
        'error_code': code,
        'data': payload,
    }
    return Response(data=payload, status=status, headers=headers)


def error_response(code, info=None, status=400, headers={}, **kwargs):
    payload = {
        **kwargs,
        'error_code': code,
        'detail': info,
    }
    return Response(data=payload, status=status, headers=headers)


def exception_handler(exc, context):
    response = _eh(exc, context)
    if response is not None:
        code = response.status_code
        if code < 400:
            default = Error.SUCCESS
        else:
            default = code
        errcode = STATUS_CODE_MAP.get(code, default)
        detail = response.data.get('detail', response.data.get('details', response.data))
        response.data = error_response(errcode, detail).data
    return response
