#!/bin/env python

import requests
import json
import hashlib
import base64
import time
import hmac

AccessId = 'Vc84jc54swmu7HM5T79r'
AccessKey = 'z}C!Mzq-4F68Yn9vPP=L7E{)D3$gfAM2n!5]!q}y'
Company = 'qauat'
encoding = 'utf-8'


def getAuth(httpVerb, data, resourcePath):
    epoch = str(int(time.time() * 1000))
    requestVars = bytes(httpVerb + epoch + data + resourcePath, encoding)
    accessKey = bytes(AccessKey, encoding)
    hexdigest = hmac.new(accessKey, msg=requestVars, digestmod=hashlib.sha256).hexdigest()
    signature = str(base64.b64encode(bytes(hexdigest, encoding)), encoding)
    auth = 'LMv1 ' + AccessId + ':' + signature + ':' + epoch
    return auth


def getHeaders(httpVerb, data, resourcePath):
    auth = getAuth(httpVerb, data, resourcePath)
    headers = {'Content-Type': 'application/json', 'Authorization': auth}
    return headers


def post(httpVerb, data, resourcePath, queryParams):
    url = 'https://' + Company + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams
    headers = getHeaders(httpVerb, data, resourcePath)
    response = requests.post(url, data=data, headers=headers)
    return response


def get(httpVerb, data, resourcePath, queryParams):
    url = 'https://' + Company + '.logicmonitor.com/santaba/rest' + resourcePath + queryParams
    headers = getHeaders(httpVerb, data, resourcePath)
    response = requests.get(url, data=data, headers=headers)
    return response


def get_filename_from_response(response):
    disposition = response.headers.get('content-disposition')
    prefix = 'filename='
    filename = disposition[disposition.rindex(prefix) + len(prefix):]
    return filename


def download(uri, foldername, index):
    response = requests.get(uri)
    file_name = get_filename_from_response(response).split('.')
    (file_name_pre, file_name_ex) = file_name
    pathfilename = '/'.join([foldername, '{}_{}.{}'.format(file_name_pre, index, file_name_ex)])

    with open(pathfilename, 'wb') as collectorFile:
        collectorFile.write(response.content)
