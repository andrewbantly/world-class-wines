import requests
import json
import unidecode

url = "https://api.sampleapis.com/wines/reds"

headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

response = requests.request("GET", url, headers=headers, data={})


wine_data = {
    "name": "reds",
    "children": []
}

myjson = response.json()

for x in myjson:
    location = [x['location']]
    if (len(location[0].split('\n'))) == 1:
        country = "unknown-country"
        town = "unknown-city"
    else:
        location = (location[0].split('\n'))
        town_name = location[2]
        town = unidecode.unidecode(town_name)
        country = location[0]

    rating = [x['rating']]
    value = float(rating[0]['average'])

    winery = [x['winery']]
    wine = [x['wine']]
    winery_name = unidecode.unidecode(winery[0])
    wine_name = unidecode.unidecode(wine[0])

    if winery_name == "Tres Mil Botellas":
        town = "Cadiz"
        country = "Spain"
    if wine_name == "Onda Napa Valley Cabernet Sauvignon 2010":
        winery_name = "Dana Estates"
        town = "Napa Valley"
        country = "United States"
    if wine_name == "Tesseron Cognac Lot No 29 X.O Exception N.V.":
        winery_name = "Tesseron"
        country= "France"
        town = "Cognac"
    if wine_name == "Chateau D Yguene 2001":
            print(x)
            wine_name = "Chateau D'Yguene 2001"
            winery_name = "Sauternes"
            town = "Sauternes"
            country = "France"



    country_node = next((child for child in wine_data["children"] if child["name"] == country), None)
    if country_node:
        # country_node["children"].append(data)
        town_node = next((child for child in country_node["children"] if child["name"] == town), None)
        if town_node:
            # town_node["children"].append(winery)
            winery_node = next((child for child in town_node["children"] if child["name"] == winery_name), None)
            if winery_node:
                winery_node["value"] += 1
            else:
                town_node["children"].append({
                "name": winery_name,
                "value": 1
            })
        else:
            country_node["children"].append({
                "name": town,
                "children": [{
                    "name": winery_name,
                    "value": 1
                }]
            })

    else:
        wine_data["children"].append({
            "name": country,
            "children": [{
                "name": town,
                "children": [{
                    "name": winery_name,
                    "value": 1
                }]
            }]
        })

with open('red_wine.json', 'w', encoding='UTF8') as f:
    json.dump(wine_data, f)

print("done")