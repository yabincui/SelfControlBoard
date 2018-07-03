
import urllib
import urllib2

from json_util import JsonUtil

class UrlUtil(object):
    @classmethod
    def urldecode(cls, url):
        if '?' not in url:
            return (url, {})
        address, values = url.split('?')
        dic = {}
        for s in values.split('&'):
            key, value = s.split('=')
            dic[key] = urllib.unquote(value)
        return (address, dic)


    @classmethod
    def urlencode(cls, address, dic):
        url = address
        if dic:
            url += '?' + urllib.urlencode(dic)
        return url

    @classmethod
    def get(cls, url, value_map):
        """ Send value_map to the url, and receive reply. """
        data = urllib.urlencode(value_map)
        req = urllib2.Request(url, data)
        response = urllib2.urlopen(req)
        return response.read()

    @classmethod
    def get_json(cls, url, value_map):
        """ Send value_map to the url, and receive json reply. """
        reply = cls.get(url, value_map)
        #print('reply = ', reply)
        return JsonUtil.decode(reply)
