from django.test import TestCase

# Create your tests here.



# import requests
# import base64

# url = "http://127.0.0.1:8000/api/detect-emotion/"

# with open("C:/FESAMR System/image testing/IMG_20220929_155953.jpg", "rb") as f:
#     img = base64.b64encode(f.read()).decode('utf-8')

# response = requests.post(url, json={
#     "image": "data:image/jpeg;base64," + img
# })

# print("Status:", response.status_code)
# print("Response:", response.text)

import requests

url = "http://127.0.0.1:8000/api/recommend-songs/"

response = requests.post(url, json={
    "emotion": "happy"
})

print(response.json())