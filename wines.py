import requests
import csv

url = "https://api.sampleapis.com/wines/reds"

headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

response = requests.request("GET", url, headers=headers, data={})

myjson = response.json()
wine_data = []
csvheader = ['WINERY', 'WINE', 'LOCATION']

for x in myjson:
    wine = [x['winery'], x['wine'], x['location']]
    wine_data.append(wine)

with open('red_wines.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(csvheader)
    writer.writerows(wine_data)

print('done')

