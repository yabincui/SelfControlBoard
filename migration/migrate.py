#!/usr/bin/python

import argparse
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from python_server.json_util import JsonUtil
from python_server.url_util import UrlUtil

def get_script_dir():
    return os.path.dirname(os.path.realpath(__file__))

class Passcode(object):
    def __init__(self):
        with open(os.path.join(get_script_dir(), 'passcode')) as f:
            self.code = f.read().strip()

passcode = Passcode()

def get(url, value_map):
    value_map['passcode'] = passcode.code
    return UrlUtil.get(url, value_map)

def get_json(url, value_map):
    value_map['passcode'] = passcode.code
    return UrlUtil.get_json(url, value_map)

def download_dailynote(filename, url):
    data = get(url + '/action_dumpDailyNotes', {'tz': '-7'})
    with open(filename, 'w') as f:
        f.write(data)

def upload_dailynote(filename, url):
    with open(filename, 'r') as f:
        data = JsonUtil.decode(f.read())
    notes = data['notes']
    emails = set()
    for note in notes:
        emails.add(note['email'])
    for email in emails:
        data = get_json(url + '/diary/passcode_clear_diaries', {'email': email})
        assert data['status'] == 'ok'

    for i, note in enumerate(notes):
        print('email: %s' % note['email'])
        print('date: %s' % note['date'])
        print('description: %s' % note['description'].encode('utf-8'))
        data = get_json(url + '/diary/passcode_add_diary', {'tz_offset': '-7', 'date': note['date'],
            'email': note['email'], 'diary': note['description']})
        sys.stderr.write('data[%d] = %s\n' % (i, data))
        assert data['status'] == 'ok'

def main():
    parser = argparse.ArgumentParser('Migrate from DailyNote2 to SelfControlBoard')
    parser.add_argument('--download-dailynote', action='store_true',
                        help='Download DailyNote from DailyNote2.')
    parser.add_argument('--upload-dailynote', action='store_true',
                        help='Upload DailyNote to SelfControlBoard.')
    parser.add_argument('--url', help='Set url for downloading/uploading data.')
    args = parser.parse_args()
    if args.download_dailynote:
        download_dailynote('dailynote', args.url)
    if args.upload_dailynote:
        upload_dailynote('dailynote', args.url)


if __name__ == '__main__':
    main()
