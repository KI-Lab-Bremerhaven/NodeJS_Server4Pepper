import requests

url="http://192.168.8.157:3000/docker-hbv-kms-http/api/v1/speach"

print(
    requests.get(
        url=url
    ).text
)
print(
    requests.post(
        data={
            'identifier': 'idq23',
            'text': 'testext', 
            'topic':'testtopic',
            'saveInDB': False, 
            'needResponse': True
        },
        url=url
    ).text
)