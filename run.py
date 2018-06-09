#!/usr/bin/python

import argparse
import subprocess

def run_cmd(args):
    subprocess.check_call(args)

def main():
    parser = argparse.ArgumentParser(description='Run app operations')
    parser.add_argument('--upload', action='store_true', help='Upload code')
    parser.add_argument('--server', action='store_true',
                        help='Setup local server')
    args = parser.parse_args()

    if args.upload:
        run_cmd(['gcloud', 'app', 'deploy', 'app.yaml', 'index.yaml', '--project',
                 'selfcontrolboard'])
    elif args.server:
        run_cmd(['rm', '-rf', 'index.yaml'])
        run_cmd(['dev_appserver.py', '--clear_datastore=yes', '--host', '0.0.0.0', 'app.yaml'])
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
