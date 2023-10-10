# Copyright 2017 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os

import flask
import openai
from flask_cors import cross_origin


def hello_world(request):
  """HTTP Cloud Function.
  Args:
      request (flask.Request): The request object.
      <http://flask.pocoo.org/docs/1.0/api/#flask.Request>
  Returns:
      The response text, or any set of values that can be turned into a
      Response object using `make_response`
      <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>.
  """
  return "Hello World!"


def hello_name(request):
  """HTTP Cloud Function.
  Args:
      request (flask.Request): The request object.
      <http://flask.pocoo.org/docs/1.0/api/#flask.Request>
  Returns:
      The response text, or any set of values that can be turned into a
      Response object using `make_response`
      <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>.
  """
  request_args = request.args

  if request_args and "name" in request_args:
    name = request_args["name"]
  else:
    name = "World"
  return "Hello {}!".format(flask.escape(name))


def python_powered(request):
  """HTTP Cloud Function.
  Args:
      request (flask.Request): The request object.
      <http://flask.pocoo.org/docs/1.0/api/#flask.Request>
  Returns:
      The response file, a JPG image that says "Python Powered"
  """
  return flask.send_from_directory(
      os.getcwd(), "python_powered.jpg", mimetype="image/jpg"
  )


@cross_origin()
def openai_complete(request):
  # Require openai_key, prompt, and model fields.
  args = request.args
  for key in ['openai_key', 'model', 'temperature', 'prompt']:
    if not key in args:
      return f'{key} parameter is required.', 400
    else:
      print(f'{key} = {args[key]}')

  openai.api_key = args['openai_key']
  try:
    temperature = float(args['temperature'])
    response = openai.ChatCompletion.create(
        model=args['model'],
        temperature=temperature,
        messages=[
            # Removed this message to be more generic.
            # {"role": "system", "content": "You are Jay Wright Forrester, an expert in system dynamics."},
            {"role": "user", "content": args['prompt']}
        ]
    )
    content = response['choices'][0]['message']['content']
    return content
  except Exception as e:
    return str(e), 400
